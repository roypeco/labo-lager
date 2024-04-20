package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "go-app/PackagesLogin"
)

func main() {
    e := echo.New()
    e.Use(middleware.CORS())
    e.Use(middleware.Logger())
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    e.GET("/register", PackagesLogin.RegisterUser)
    e.GET("/login", PackagesLogin.Login)
    e.Logger.Fatal(e.Start(":8000"))
}
