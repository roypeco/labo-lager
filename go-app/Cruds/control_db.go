package Cruds

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
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

func RegisterUser(c echo.Context) error {
	u := new(User)
	a := new(Auth)
	r := new(RegistUserRequest)
	m := new(Message)
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

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		return err
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	// usernameが既に存在するかの確認
	db.Find(&UsernameLSlice)
	for _, user := range UsernameLSlice {
		if user.UserName == r.UserName {
			m.Content = "already exist"
			return c.JSON(http.StatusOK, m)
		}
	}

	err = db.Create(&u).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	db.Where("user_name = ?", u.UserName).First(&u)
	a.UserID = uint(u.ID)
	err = db.Create(&a).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	return c.JSON(http.StatusOK, u)
}

func CreateStore(c echo.Context) error {
	token := c.Get("user").(*jwt.Token)
	u := User{}
	s := Store{}
	us := UserStore{}
	r := CreateStoreRequest{}
	if err := c.Bind(&r); err != nil {
		return err
	}
	u.UserName = r.UserName
	s.StoreName = r.StoreName
	s.Description = r.Description

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	if !(IsValid(token, int(u.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}

	err = db.Create(&s).Error
	if err != nil {
		panic(err.Error())
	}
	// fmt.Printf("%+v", r)
	db.Where("store_name = ?", s.StoreName).First(&s)
	us.UserID = u.ID
	us.StoreID = s.ID
	us.Roll = "M"
	err = db.Create(&us).Error
	if err != nil {
		panic(err.Error())
	}
	// db.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)
	// u.UserStoreID = us.ID
	// u.IsOwner = true
	// s.UserStoreID = us.ID

	// db.Save(&u)
	// db.Save(&s)
	return c.JSON(http.StatusOK, map[string]string{"message": "success"})
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
	i.ItemName = r.ItemName
	i.Num = r.Num
	i.Price = r.Price
	i.Category = r.Category
	s.StoreName = r.StoreName
	u.UserName = r.UserName

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)
	if us.Roll != "M" {
		return c.String(http.StatusOK, "permission error")
	}
	i.UserId = uint(u.ID)
	i.StoreID = uint(s.ID)
	err = db.Create(&i).Error
	if err != nil {
		panic(err.Error())
	}

	// 画像ファイルをs3にアップロード
	err = db.Last(&i).Error
	if err != nil {
		panic(err.Error())
	}

	// ファイルを開く
	file, err := c.FormFile("file")
	if err != nil {
		log.Println("ファイルが読み込めませんでした")
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// ファイルをS3にアップロード
	err = uploadFileToS3(src, fmt.Sprintf("images/%s/%d.jpg", r.StoreName, i.ID))
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
	s.StoreName = r.StoreName
	us.Roll = r.Roll

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	us.UserID = u.ID
	us.StoreID = s.ID
	// db.Save(&u)
	err = db.Where("user_id = ? AND store_id = ?", u.ID, s.ID).First(&us).Error
	if err != nil {
		err = db.Create(&us).Error
		if err != nil {
			panic(err.Error())
		}
		return c.String(http.StatusOK, "success")
	}
	us.Roll = r.Roll
	err = db.Save(&us).Error
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
	s.StoreName = r.StoreName
	i.ID = uint(r.ItemID)
	h.Num = r.Num

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("id = ?", i.ID).First(&i)
	db.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)

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
	err = db.Create(&h).Error
	if err != nil {
		panic(err.Error())
	}
	db.Save(&i)

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
	s.StoreName = r.StoreName

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("id = ?", i.ID).First(&i)
	db.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)

	if us.Roll != "M" || i.UserId != u.ID {
		return c.String(http.StatusOK, "permission error")
	}
	i.Num += r.Num
	db.Save(&i)

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

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", u.UserName).First(&u)
	a.UserID = u.ID
	db.Where("user_id = ?", u.ID).First(&a)

	h := sha256.New()
	io.WriteString(h, r.Pass)

	pw_sha256 := fmt.Sprintf("%x", h.Sum(nil))
	salt := os.Getenv("SALT")
	io.WriteString(h, salt)
	io.WriteString(h, pw_sha256)
	check_hash := fmt.Sprintf("%x", h.Sum(nil))
	if check_hash != a.PassHash {
		return c.String(http.StatusOK, "not correct")
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
	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", user.UserName).First(&user)
	db.Where("user_id = ?", user.ID).Find(&user_stores)

	if !(IsValid(token, int(user.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}

	for _, user_store := range user_stores {
		store := Store{}
		db.Where("id = ?", user_store.StoreID).First(&store)
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
	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("user_name = ?", user.UserName).First(&user)
	if !(IsValid(token, int(user.ID))) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}
	db.Not("user_id = ?", user.ID).Find(&user_stores)
	log.Printf("%+v", user_stores)

	for _, user_store := range user_stores {
		store := Store{}
		db.Where("id = ?", user_store.StoreID).First(&store)
		stores = append(stores, store)
	}

	return c.JSON(http.StatusOK, stores)
}

func GetStock(c echo.Context) error {
	s := Store{}
	items := []Item{}
	s.StoreName = c.Param("storename")

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("store_id = ? AND num > ?", s.ID, 0).Find(&items)
	return c.JSON(http.StatusOK, items)
}

func GetAllStock(c echo.Context) error {
	s := Store{}
	items := []Item{}
	s.StoreName = c.Param("storename")

	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic(err.Error())
		}
		if err := sqlDB.Close(); err != nil {
			panic(err.Error())
		}
	}()

	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("store_id = ?", s.ID).Find(&items)
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
