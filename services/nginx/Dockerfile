# nginx Dockerfile
FROM alpine:3.19.4

WORKDIR /app
RUN apk add --no-cache nginx \
    && mkdir -p /usr/share/nginx/html/avatars

COPY conf/default.conf /etc/nginx/http.d/default.conf
COPY avatar/img_default.png /usr/share/nginx/html/avatars/img_default.png

RUN chown -R 1000:1000 /usr/share/nginx/html/avatars \
    && chmod -R 755 /usr/share/nginx/html/avatars

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
