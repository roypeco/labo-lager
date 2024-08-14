package main

import (
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID       uint
	UserName string   `gorm:"unique; not null"`
	Stores   []*Store `gorm:"many2many:user_stores;"`
}

type Auth struct {
	ID       uint
	PassHash string
	UserID   uint `gorm:"not null"`
	User     User
}

type Item struct {
	ID       uint
	ItemName string
	Price    int
	Num      int
	ImgPass  string
	Category string `gorm:"default:other"`
	UserId   uint   `gorm:"not null"`
	User     User
	StoreID  uint `gorm:"not null"`
	Store    Store
}

type Store struct {
	ID          uint
	StoreName   string `gorm:"unique; not null"`
	Description string
	Users       []*User `gorm:"many2many:user_stores"`
}

type History struct {
	ID       uint
	ItemName string
	Num      int
	Price    int
	SellerID uint
	UserID   uint `gorm:"not null"`
	User     User
	StoreID  uint `gorm:"not null"`
	Store    Item
}

type UserStore struct {
	ID      uint
	UserID  uint   `gorm:"not null"`
	StoreID uint   `gorm:"not null"`
	Roll    string `gorm:"size:15"`
}

func main() {
	// MySQLへの接続情報
	dsn := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
		os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// データベースを作成する
	dbName := os.Getenv("DATABASE_NAME")
	err = db.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", dbName)).Error
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Database created successfully")

	// マイグレーションを実行してテーブルを作成
	db.Migrator().DropTable(&User{}, &Item{}, &Store{}, &History{}, &Auth{}, &UserStore{})
	db.AutoMigrate(&User{}, &Item{}, &Store{}, &History{}, &Auth{}, &UserStore{})

	fmt.Println("テーブルが作成されました。")

	// DB接続を閉じる
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
}
