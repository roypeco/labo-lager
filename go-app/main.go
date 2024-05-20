package main

import (
	"go-app/Cruds"
	"net/http"
    "os"

	"github.com/labstack/echo/v4"
    "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()
    e.Use(middleware.CORS())
    e.Use(middleware.Recover())
    e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
        Format: `${time_rfc3339_nano} ${host} ${method} ${uri} ${status} ${header:my-header}` + "\n",
    }))

    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        panic("JWT Secret not found")
    }

    config := echojwt.Config{
        SigningKey: []byte(jwtSecret),
        ContextKey: "user", 
        TokenLookup: "header:Authorization",
    }

    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    e.GET("/health_check", Cruds.HealthCheck)
    e.POST("/register/user", Cruds.RegisterUser)
    e.PUT("/register/user", Cruds.AddUserToStore)
    e.POST("/register/store", Cruds.CreateStore)
    e.POST("/register/item", Cruds.RegisterItem)
    e.POST("/register/replenishment", Cruds.ReplenishmentItem)
    e.POST("/buy", Cruds.BuyItem)
    e.POST("/login", Cruds.Login)
    e.GET("/stock/:storename", Cruds.GetStock)
    e.GET("/stock_all/:storename", Cruds.GetAllStock)

    restricted := e.Group("/whoami")
	restricted.Use(echojwt.WithConfig(config))
	restricted.GET("", Cruds.WhoAmI)

    e.Logger.Fatal(e.Start(":8000"))
}
