FROM golang:1.22.1
RUN apt-get update && apt-get install -y build-essential
COPY ./go-app /app/go
WORKDIR /app/go
RUN pwd
RUN go build -o main .
CMD [ "/app/go/main" ]
