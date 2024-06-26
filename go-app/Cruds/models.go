package Cruds

// SQL Table Models
type User struct {
	ID       uint   `gorm:"column:id"`
	UserName string `gorm:"column:user_name" json:"username"`
	// IsOwner     bool   `gorm:"column:is_owner"`
	// UserStoreID uint   `gorm:"column:user_store_id"`
}

type Auth struct {
	ID       uint   `gorm:"column:id"`
	PassHash string `gorm:"column:pass_hash" json:"pass"`
	UserID   uint   `gorm:"column:user_id"`
}

type Item struct {
	ID       uint   `gorm:"column:id"`
	ItemName string `gorm:"column:item_name"`
	Price    int    `gorm:"column:price"`
	Category string `gorm:"column:category"`
	JanCode  string `gorm:"column:jan_code"`
	Num      int    `gorm:"column:num"`
	UserId   uint   `gorm:"column:user_id"`
	StoreID  uint   `gorm:"column:store_id"`
}

type Store struct {
	ID          uint   `gorm:"column:id"`
	StoreName   string `gorm:"column:store_name"`
	Description string `gorm:"column:description"`
	// UserStoreID uint   `gorm:"column:user_store_id"`
}

type History struct {
	ID       uint   `gorm:"column:id"`
	ItemName string `gorm:"column:item_name"`
	Num      int    `gorm:"column:num"`
	Price    int    `gorm:"column:price"`
	SellerID uint   `gorm:"column:seller_id"`
	UserID   uint   `gorm:"column:user_id"`
	StoreID  uint   `gorm:"column:store_id"`
}

type UserStore struct {
	ID      uint   `gorm:"column:id"`
	UserID  uint   `gorm:"column:user_id"`
	StoreID uint   `gorm:"column:store_id"`
	Roll    string `gorm:"column:roll"`
}

// JSON Request Structs
type RegistUserRequest struct {
	UserName string `json:"username"`
	Pass     string `json:"pass"`
}

type CreateStoreRequest struct {
	UserName    string `json:"username"`
	StoreName   string `json:"storename"`
	Description string `json:"description"`
}

type RegisterItemRequest struct {
	UserName  string `json:"username"`
	StoreName string `json:"storename"`
	ItemName  string `json:"itemname"`
	Category  string `json:"category"`
	Price     int    `json:"price"`
	JanCode   string `json:"jancode"`
	Num       int    `json:"num"`
}

type AddUserToStoreRequest struct {
	UserName  string `json:"username"`
	StoreName string `json:"storename"`
	Roll      string `json:"roll"`
}

type BuyItemRequest struct {
	UserName  string `json:"username"`
	StoreName string `json:"storename"`
	ItemID    uint   `json:"itemid"`
	Num       int    `json:"num"`
}

type ReplenishmentItemRequest struct {
	Username  string `json:"username"`
	StoreName string `json:"storename"`
	ItemID    uint   `jsoon:"itemid"`
	Num       int    `json:"num"`
}

type LoginRequest struct {
	UserName string `json:"username"`
	Pass     string `json:"pass"`
}

// JSON Response Structs

type Message struct {
	Content string `json:"content"`
}
