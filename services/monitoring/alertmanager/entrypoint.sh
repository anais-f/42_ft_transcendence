#!/bin/sh
echo "Template exists?"; ls -l /etc/alertmanager/
DISCORD_WEBHOOK_URL=$(cat /run/secrets/discord_webhook)
export DISCORD_WEBHOOK_URL
echo "Discord Webhook URL: $DISCORD_WEBHOOK_URL"
envsubst < /etc/alertmanager/alertmanager.yml.template > /etc/alertmanager/alertmanager.yml
cat /etc/alertmanager/alertmanager.yml
exec /bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml "$@"
