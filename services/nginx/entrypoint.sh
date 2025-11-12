#!/bin/sh
apk add --no-cache gettext
echo "--" $host "--"
ADMIN_TOKEN=$(cat /run/secrets/admin_token)
export ADMIN_TOKEN
sed -i 's/${ADMIN_TOKEN}/'"$ADMIN_TOKEN"'/g' /etc/nginx/http.d/default.conf
cat /etc/nginx/http.d/default.conf
exec nginx -g 'daemon off;'
