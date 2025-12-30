#!/bin/sh
envsubst '$HOSTNAME $PORT' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf
cat /etc/nginx/http.d/default.conf
exec nginx -g 'daemon off;' 
