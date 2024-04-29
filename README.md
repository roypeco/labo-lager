## For Developer

### Frontend

- 好きに実装してください

### Backend

- ルーターはmain.goに含まれていて，呼び出された際にそれぞれのパッケージから呼び出しています

### DB

- マイグレーションはdocker containerを起動し，goのコンテナに入ったのちに以下のコマンドを実行してください
```bash
cd db && ./migration
```
- migration.goを変更した場合以下のコマンドを実行してください
```bash
cd db && go build migration.go
./migration
```

# 仕様書

## やりたいこと

研究室のような小コミュニティで小売店のようなものをするにあたって在庫・値段管理や支払いができるアプリ

## 今やっていること・これからやること

### バックエンド

- [x] ユーザ登録　POST:/register/user {username:str, pass:str}
- [x] 店登録　POST:/register/store {username:str, storename:str, description:str}
- [x] 商品登録　POST:/register/item {username:str, storename:str, itemname:str, category:str, price:int, jancode:str, num:int}
- [x] オーナー，顧客登録　PUT:/register/user {username:str, sorename:str, roll:str}
- [x] 商品購入　POST:/buy (username:str, storename:str, itemid:int, num:int)
- [ ] 商品補充　(検討中)

### フロントエンド

- 放置中

### DB

- user

| id(int)        | username(str) | pass_hash(str) | is_owner(bool) | 
| -------------- | ------------- | -------------- | -------------- | 
| prim           | not null      | not null       | default 0      | 
| auto increment | unique        |                |                | 