package Cruds

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
	"io"
	"fmt"
	"crypto/sha256"
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

	pw_sha256 :=fmt.Sprintf("%x", h.Sum(nil))
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

func MakeYouOwner(c echo.Context) error {
	u := User{}
	dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
        os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
    )
	if err := c.Bind(&u); err != nil {
		return err
	}
	db, err := gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})
    if err != nil {
        panic(err.Error())
    }
	db.Where("username = ?", u.UserName).First(&u)
	u.IsOwner = true
	db.Save(&u)
	return c.String(http.StatusOK, "success")
}
