### For Developer

#### バックエンド

- ルーターはmain.goに含まれていて，呼び出された際にそれぞれのパッケージから呼び出しています

#### DB

- マイグレーションはdocker containerを起動し，goのコンテナに入ったのちに以下のコマンドを実行してください
```bash
cd db & ./migration
```
- migration.goを変更した場合以下のコマンドを実行してください
```bash
cd db & go build migration.go
./migration
```