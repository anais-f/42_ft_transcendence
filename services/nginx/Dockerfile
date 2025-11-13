# nginx Dockerfile
FROM alpine:3.19.4

WORKDIR /app
RUN apk add --no-cache nginx
RUN mkdir -p /usr/share/nginx/html/avatars

COPY conf/default.conf /etc/nginx/http.d/default.conf
COPY avatars/img_default.png /usr/share/nginx/html/avatars/img_default.png
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

RUN chown -R 1000:1000 /usr/share/nginx/html/avatars \
    && chmod -R 755 /usr/share/nginx/html/avatars

EXPOSE 8080

ENTRYPOINT [ "entrypoint.sh" ]
