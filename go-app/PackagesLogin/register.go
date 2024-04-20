package PackagesLogin

import (
	"net/http"
	"github.com/labstack/echo/v4"
)

func RegisterUser(c echo.Context) error {
	return c.String(http.StatusOK, "this is RegisterUser")
}

func Login(c echo.Context) error {
	return c.String(http.StatusOK, "this is Login")
}