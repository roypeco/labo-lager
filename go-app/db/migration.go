package main

import (
    "database/sql"
    "fmt"
    "os"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    // MySQLへの接続情報
    dataSourceName := fmt.Sprintf(`%s:%s@tcp(%s)/%s`,
        os.Getenv("USER_NAME"), os.Getenv("MYSQL_ROOT_PASSWORD"), os.Getenv("HOST_PORT"), os.Getenv("DATABASE_NAME"),
    )

    // MySQLに接続
    db, err := sql.Open("mysql", dataSourceName)
    if err != nil {
        panic(err.Error())
    }
    defer db.Close()

    // テーブル削除のSQLクエリ
    dropTableSQL := `
        DROP TABLE IF EXISTS users;
    `

    // 既存のテーブルがあれば削除
    _, err = db.Exec(dropTableSQL)
    if err != nil {
        panic(err.Error())
    }

    // テーブル作成のSQLクエリ
    createTableSQL := `
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            pass_hash VARCHAR(100) NOT NULL,
            is_owner BOOLEAN DEFAULT 0
        );
    `

    // テーブル作成のSQLクエリを実行
    _, err = db.Exec(createTableSQL)
    if err != nil {
        panic(err.Error())
    }

    fmt.Println("テーブルが作成されました。")
}
