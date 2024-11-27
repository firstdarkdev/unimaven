FROM node:20 AS frontend-builder

WORKDIR /app/frontend
COPY ./frontend .
RUN npm install
RUN npm run build

FROM golang:1.23.3-alpine AS build

WORKDIR /app
COPY . /app
RUN go mod download
RUN go build -o unimaven

FROM alpine:latest

WORKDIR /app
COPY --from=frontend-builder /app/frontend/out /app/webcontent
COPY --from=build /app/unimaven /app/unimaven
RUN chmod +x /app/unimaven

EXPOSE 8080

CMD ["/app/unimaven"]