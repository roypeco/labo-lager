package main

import (
    "fmt"
    "os"
    "gorm.io/driver/mysql"
	"gorm.io/gorm"
    _ "github.com/go-sql-driver/mysql"
)

type User struct {
    ID          uint
    UserName    string      `gorm:"unique; not null"`
    IsOwner     bool        `gorm:"default:0"`
    UserStoreID uint
    UserStore   UserStore
    Stores      []*Store    `gorm:"many2many:user_stores;"`
}

type Auth struct {
    ID          uint
    PassHash    string
    UserID      int         `gorm:"not null"`
    User        User
}

type Item struct {
    ID          uint
    ItemName    string
    Price       int
    JanCode     string
    Num         int
    Category    string      `gorm:"default:other"`
    UserId      int         `gorm:"not null"`
    User        User
    StoreID     int         `gorm:"not null"`
    Store       Store
}

type Store struct {
    ID          uint
    StoreName   string
    Description string
    UserStoreID uint
    UserStore   UserStore
    Users       []*User     `gorm:"many2many:user_stores"`
}

type History struct {
    ID          uint
    ItemName    string
    Num         int
    Price       int
    UserID      int         `gorm:"not null"`
    User        User
    ItemID      int         `gorm:"not null"`
    Item        Item
}

type UserStore struct {
    ID          uint
    UserID      uint        `gorm:"not null"`
    StoreID     uint        `gorm:"not null"`
    Roll        string      `gorm:"size:15"`
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

    // マイグレーションを実行してテーブルを作成
    db.Migrator().DropTable(&User{}, &Item{}, &Store{}, &History{}, &Auth{}, &UserStore{})
    db.AutoMigrate(&User{}, &Item{}, &Store{}, &History{}, &Auth{}, &UserStore{})

    fmt.Println("テーブルが作成されました。")
}
