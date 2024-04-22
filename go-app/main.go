package main

import (
	"go-app/Cruds"
	"go-app/PackagesLogin"
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()
    e.Use(middleware.CORS())
    e.Use(middleware.Logger())
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    e.POST("/register", Cruds.RegisterUser)
    e.GET("/login", PackagesLogin.Login)
    e.Logger.Fatal(e.Start(":8000"))
}
