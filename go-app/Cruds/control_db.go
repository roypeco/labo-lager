package Cruds

import (
	// "encoding/json"
	"github.com/labstack/echo/v4"
	"net/http"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
	"fmt"
)

type User struct {
	Username string `json:"username"`
	Pass_Hash string `json:"pass_hash"` 
}

func RegisterUser(c echo.Context) error {
	u := new(User)
	if err := c.Bind(u); err != nil {
		return err
	}

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

	return c.String(http.StatusOK, "success")
}