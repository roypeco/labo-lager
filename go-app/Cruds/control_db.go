package Cruds

import (
	"crypto/sha256"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func RegisterUser(c echo.Context) error {
	u := new(User)
	a := new(Auth)
	r := new(RegistUserRequest)
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

	err = db.Create(&u).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	db.Where("user_name = ?", u.UserName).First(&u)
	a.UserID = int(u.ID)
	err = db.Create(&a).Error
	if err != nil {
		fmt.Printf("Create user with related data error: %s", err.Error())
		return err
	}

	return c.String(http.StatusOK, "success")
}

func CreateStore(c echo.Context) error {
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

	err = db.Create(&s).Error
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v", r)
	db.Where("user_name = ?", u.UserName).First(&u)
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
	return c.String(http.StatusOK, "success")
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
	i.JanCode = r.JanCode
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
	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	db.Where("user_id = ?", u.ID).Where("store_id = ?", s.ID).First(&us)
	if us.Roll != "M" {
		return c.String(http.StatusOK, "permission error")
	}
	i.UserId = int(u.ID)
	i.StoreID = int(s.ID)
	err = db.Create(&i).Error
	if err != nil {
		panic(err.Error())
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
	db.Where("user_name = ?", u.UserName).First(&u)
	db.Where("store_name = ?", s.StoreName).First(&s)
	us.UserID = u.ID
	us.StoreID = s.ID
	db.Save(&u)
	err = db.Create(&us).Error
	if err != nil {
		panic(err.Error())
	}

	return c.String(http.StatusOK, "success")
}
