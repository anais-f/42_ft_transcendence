FROM alpine:3.19.4

WORKDIR /app
RUN apk add nginx --no-cache
COPY conf/default.conf /etc/nginx/http.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
