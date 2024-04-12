package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", echoHello)
	http.ListenAndServe(":8000", nil)
}

func echoHello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "<h1>Hello World</h1>")
}