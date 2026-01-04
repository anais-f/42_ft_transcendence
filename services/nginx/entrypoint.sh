#!/bin/sh
envsubst '$HOSTNAME $PORT $USERS_SERVICE_URL $TWOFA_SERVICE_URL $AUTH_SERVICE_URL $SOCIAL_SERVICE_URL $GAME_SERVICE_URL' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf
cat /etc/nginx/http.d/default.conf
exec nginx -g 'daemon off;' 
