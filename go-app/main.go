package main

import (
	"go-app/Cruds"
	"go-app/Auth"
	"os"

	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `${time_rfc3339_nano} ${host} ${method} ${uri} ${status} ${header:my-header}` + "\n",
	}))

	// JWTの設定
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		panic("JWT Secret not found")
	}

	config := echojwt.Config{
		SigningKey:  []byte(jwtSecret),
		ContextKey:  "user",
		TokenLookup: "header:Authorization",
	}

	// エンドポイントの設定
	// JWT認証なし
	e.GET("/health_check", Cruds.HealthCheck)
	e.POST("/register/user", Cruds.RegisterUser)
	e.POST("/login", Cruds.Login)
	
	// JWT認証あり
	restricted := e.Group("/restricted")
	restricted.Use(echojwt.WithConfig(config))
	restricted.GET("/whoami", Auth.WhoAmI)
	restricted.GET("/permission", Cruds.CheckOwner)
	restricted.PUT("/register/user", Cruds.AddUserToStore)
	restricted.PUT("/delete/item", Cruds.DeleteItem)
	restricted.GET("/stores", Cruds.GetStores)
	restricted.GET("/other_stores", Cruds.GetOtherStores)
	restricted.POST("/register/store", Cruds.CreateStore)
	restricted.POST("/register/item", Cruds.RegisterItem)
	restricted.POST("/register/replenishment", Cruds.ReplenishmentItem)
	restricted.POST("/buy", Cruds.BuyItem)
	restricted.GET("/stock/:storename", Cruds.GetStock)
	restricted.GET("/stock_all/:storename", Cruds.GetAllStock)

	// サーバー開始
	e.Logger.Fatal(e.Start(":8000"))
}
