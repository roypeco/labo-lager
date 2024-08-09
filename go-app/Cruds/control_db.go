package Cruds

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	var err error
	DB, err = gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
}

func GetDB() *gorm.DB {
	return DB
}

func RegisterUser(c echo.Context) error {
	u := new(User)
	a := new(Auth)
	r := new(RegistUserRequest)
	UsernameLSlice := []User{}
	if err := c.Bind(r); err != nil {
		return err
	}
	u.UserName = r.UserName
	h := sha256.New()
	io.WriteString(h, r.Pass)

	pw_sha256 := fmt.Sprintf("%x", h.Sum(nil))
	salt := os.Getenv("SALT")
	io.WriteString(h, salt)
	io.WriteString(h, pw_sha256)
	a.PassHash = fmt.Sprintf("%x", h.Sum(nil))

	// usernameが既に存在するかの確認
	DB.Find(&UsernameLSlice)
	for _, user := range UsernameLSlice {
		if user.UserName == r.UserName {
			return c.JSON(http.StatusOK, map[string]string{"status": "existing"})
		}
	}

	err := DB.Create(&u).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	DB.Where("user_name = ?", u.UserName).First(&u)
	a.UserID = uint(u.ID)
	err = DB.Create(&a).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func CreateStore(c echo.Context) error {
	token := c.Get("user").(*jwt.Token)
	u := User{}
	s := Store{}
	storesSlice := []Store{}
	us := UserStore{}
	r := CreateStoreRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.UserName
	s.Description = r.Description

	// StoreNameのデコード
	decodedStoreName, err := url.QueryUnescape(r.StoreName)
	if err != nil {
		return err
	}
	s.StoreName = decodedStoreName

	// storenameが既に存在するかの確認
	DB.Find(&storesSlice)
	for _, store := range storesSlice {
		if store.StoreName == r.StoreName {
			return c.JSON(http.StatusOK, map[string]string{"status": "existing"})
		}
	}

	DB.Where("user_name = ?", u.UserName).First(&u)
	if !(IsValid(token, int(u.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}

	err = DB.Create(&s).Error
	if err != nil {
		panic(err.Error())
	}
	// fmt.Printf("%+v", r)
	DB.Where("store_name = ?", s.StoreName).First(&s)
	us.UserID = u.ID
	us.StoreID = s.ID
	us.Roll = "M"
	err = DB.Create(&us).Error
	if err != nil {
		panic(err.Error())
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func RegisterItem(c echo.Context) error {
	i := Item{}
	u := User{}
	us := UserStore{}
	s := Store{}
	r := RegisterItemRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	now := time.Now()

	// フォーマットされた時刻を生成
	formattedTime := now.Format("060102150405")
	i.ItemName = r.ItemName
	i.Num = r.Num
	i.Price = r.Price
	i.Category = r.Category
	i.ImgPass = fmt.Sprintf("images/%s/%s.jpg", r.StoreName, formattedTime)
	u.UserName = r.UserName

	// StoreNameのデコード
	decodedStoreName, err := url.QueryUnescape(r.StoreName)
	if err != nil {
		return err
	}
	s.StoreName = decodedStoreName

	DB.Where("user_name = ?", u.UserName).First(&u)
	DB.Where("store_name = ?", s.StoreName).First(&s)
	DB.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)
	if us.Roll != "M" {
		return c.String(http.StatusOK, "permission error")
	}
	i.UserId = uint(u.ID)
	i.StoreID = uint(s.ID)

	// ファイルの有無を確認
	file, err := c.FormFile("file")
	if err != nil {
		log.Println("ファイルが読み込めませんでした")
		i.ImgPass = ""
		err = DB.Create(&i).Error
		if err != nil {
			panic(err.Error())
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "no img registered"})
	}

	err = DB.Create(&i).Error
	if err != nil {
		panic(err.Error())
	}

	// 画像ファイルをs3にアップロード
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// ファイルをS3にアップロード
	err = uploadFileToS3(src, fmt.Sprintf(i.ImgPass))
	if err != nil {
		return err
	}

	return c.String(http.StatusOK, "success")
}

func AddUserToStore(c echo.Context) error {
	u := User{}
	s := Store{}
	us := UserStore{}
	r := AddUserToStoreRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.UserName
	us.Roll = r.Roll

	// StoreNameのデコード
	decodedStoreName, err := url.QueryUnescape(r.StoreName)
	if err != nil {
		return err
	}
	s.StoreName = decodedStoreName

	DB.Where("user_name = ?", u.UserName).First(&u)
	DB.Where("store_name = ?", s.StoreName).First(&s)
	us.UserID = u.ID
	us.StoreID = s.ID
	// db.Save(&u)
	err = DB.Where("user_id = ? AND store_id = ?", u.ID, s.ID).First(&us).Error
	if err != nil {
		err = DB.Create(&us).Error
		if err != nil {
			panic(err.Error())
		}
		return c.String(http.StatusOK, "success")
	}
	us.Roll = r.Roll
	err = DB.Save(&us).Error
	if err != nil {
		panic(err.Error())
	}

	return c.String(http.StatusOK, "success")
}

func BuyItem(c echo.Context) error {
	u := User{}
	s := Store{}
	i := Item{}
	h := History{}
	us := UserStore{}
	r := BuyItemRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.UserName
	i.ID = uint(r.ItemID)
	h.Num = r.Num

	// StoreNameのデコード
	decodedStoreName, err := url.QueryUnescape(r.StoreName)
	if err != nil {
		return err
	}
	s.StoreName = decodedStoreName

	DB.Where("user_name = ?", u.UserName).First(&u)
	DB.Where("store_name = ?", s.StoreName).First(&s)
	DB.Where("id = ?", i.ID).First(&i)
	DB.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)

	if us.Roll != "M" && us.Roll != "C" {
		return c.String(http.StatusOK, "permission error")
	}
	if i.Num < r.Num {
		return c.String(http.StatusOK, "out of stock")
	}
	h.ItemName = i.ItemName
	h.Price = i.Price * r.Num
	h.StoreID = uint(s.ID)
	h.UserID = uint(u.ID)
	h.SellerID = uint(i.UserId)
	i.Num = i.Num - r.Num
	err = DB.Create(&h).Error
	if err != nil {
		panic(err.Error())
	}
	DB.Save(&i)

	return c.String(http.StatusOK, "success")
}

func ReplenishmentItem(c echo.Context) error {
	u := User{}
	i := Item{}
	s := Store{}
	us := UserStore{}
	r := ReplenishmentItemRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.Username
	i.ID = r.ItemID

	// StoreNameのデコード
	decodedStoreName, err := url.QueryUnescape(r.StoreName)
	if err != nil {
		return err
	}
	s.StoreName = decodedStoreName

	DB.Where("user_name = ?", u.UserName).First(&u)
	DB.Where("store_name = ?", s.StoreName).First(&s)
	DB.Where("id = ?", i.ID).First(&i)
	DB.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)

	if us.Roll != "M" || i.UserId != u.ID {
		return c.String(http.StatusOK, "permission error")
	}
	i.Num += r.Num
	DB.Save(&i)

	return c.String(http.StatusOK, "succsess")
}

func Login(c echo.Context) error {
	u := User{}
	a := Auth{}
	r := LoginRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.UserName

	DB.Where("user_name = ?", u.UserName).First(&u)
	a.UserID = u.ID
	DB.Where("user_id = ?", u.ID).First(&a)

	h := sha256.New()
	io.WriteString(h, r.Pass)

	pw_sha256 := fmt.Sprintf("%x", h.Sum(nil))
	salt := os.Getenv("SALT")
	io.WriteString(h, salt)
	io.WriteString(h, pw_sha256)
	check_hash := fmt.Sprintf("%x", h.Sum(nil))
	if check_hash != a.PassHash {
		return c.JSON(http.StatusOK, map[string]string{"status": "not correct"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userid": u.ID,
		"exp":    time.Now().Add(time.Hour * 24).Unix(),
	})

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT Secret not found"})
	}

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token"})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":   "ok",
		"token":    tokenString,
		"username": u.UserName,
	})
}

func GetStores(c echo.Context) error {
	token := c.Get("user").(*jwt.Token)
	user := User{}
	username := c.QueryParam("username")
	user.UserName = username
	stores := []Store{}
	user_stores := []UserStore{}

	DB.Where("user_name = ?", user.UserName).First(&user)
	DB.Where("user_id = ?", user.ID).Find(&user_stores)

	if !(IsValid(token, int(user.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}

	for _, user_store := range user_stores {
		store := Store{}
		DB.Where("id = ?", user_store.StoreID).First(&store)
		stores = append(stores, store)
	}

	return c.JSON(http.StatusOK, stores)
}

func GetOtherStores(c echo.Context) error {
	token := c.Get("user").(*jwt.Token)
	user := User{}
	username := c.QueryParam("username")
	user.UserName = username
	stores := []Store{}
	user_stores := []UserStore{}

	DB.Where("user_name = ?", user.UserName).First(&user)
	if !(IsValid(token, int(user.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}
	DB.Not("user_id = ?", user.ID).Find(&user_stores)
	log.Printf("%+v", user_stores)

	for _, user_store := range user_stores {
		store := Store{}
		DB.Where("id = ?", user_store.StoreID).First(&store)
		stores = append(stores, store)
	}

	return c.JSON(http.StatusOK, stores)
}

func GetStock(c echo.Context) error {
	s := Store{}
	items := []Item{}
	s.StoreName = c.Param("storename")

	DB.Where("store_name = ?", s.StoreName).First(&s)
	DB.Where("store_id = ? AND num > ?", s.ID, 0).Find(&items)
	return c.JSON(http.StatusOK, items)
}

func GetAllStock(c echo.Context) error {
	s := Store{}
	items := []Item{}
	s.StoreName = c.Param("storename")

	DB.Where("store_name = ?", s.StoreName).First(&s)
	DB.Where("store_id = ?", s.ID).Find(&items)
	return c.JSON(http.StatusOK, items)
}

func HealthCheck(c echo.Context) error {
	log.Println("healthcheckが実行されました")
	return c.String(http.StatusOK, "Server is running")
}

func IsValid(token *jwt.Token, uid int) bool {
	if token == nil {
		return false
	}
	claims := token.Claims.(jwt.MapClaims)
	userID := claims["userid"].(float64)
	if int(userID) == uid {
		return true
	} else {
		return false
	}
}

func uploadFileToS3(file multipart.File, filePath string) error {
	// デフォルトのセッションを初期化
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")), // S3バケットのリージョンに変更してください
	})
	if err != nil {
		return err
	}

	// S3サービスクライアントを作成
	svc := s3.New(sess)

	// アップロードパラメータを設定
	params := &s3.PutObjectInput{
		Bucket: aws.String("labolager-bucket"), // S3バケット名に変更してください
		Key:    aws.String(filePath),
		Body:   file,
	}

	// ファイルをS3にアップロード
	_, err = svc.PutObject(params)
	return err
}

func CheckOwner(c echo.Context) error {
	username := c.QueryParam("username")
	storename := c.QueryParam("storename")
	user := User{}
	store := Store{}
	user_store := UserStore{}
	user.UserName = username
	store.StoreName = storename

	DB.Where("user_name = ?", user.UserName).First(&user)
	DB.Where("store_name = ?", store.StoreName).First(&store)
	DB.Where("user_id = ? AND store_id = ?", user.ID, store.ID).First(&user_store)

	return c.JSON(http.StatusOK, map[string]string{"Roll": user_store.Roll})
}

func DeleteItem(c echo.Context) error {
	item_id := c.QueryParam("itemid")
	// 数値型のIDに変換
	itemID, err := strconv.Atoi(item_id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid item_id"})
	}

	// 主キーを指定して削除
	err = DB.Delete(&Item{}, itemID).Error
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete item"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "success"})
}
