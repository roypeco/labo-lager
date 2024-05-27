package Auth

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func WhoAmI(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	if user == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "invalid or expired jwt"})
	}
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["userid"].(float64)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "You are authenticated",
		"userid":  uint(userID),
	})
}

func IsValid(token *jwt.Token) int {
	if token == nil {
		return -1
	}
	claims := token.Claims.(jwt.MapClaims)
	userID := claims["userid"].(float64)
	return int(userID)
}
