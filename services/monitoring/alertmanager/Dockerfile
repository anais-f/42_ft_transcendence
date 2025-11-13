FROM alpine:3.22

RUN  apk add --no-cache gettext

WORKDIR /app

COPY --from=prom/alertmanager:v0.28.0 /bin/alertmanager /bin/alertmanager
COPY --from=prom/alertmanager:v0.28.0 /etc/alertmanager /etc/alertmanager
COPY ./entrypoint.sh /entrypoint.sh
COPY ./alertmanager.yaml /etc/alertmanager/alertmanager.yml.template

ENTRYPOINT ["/entrypoint.sh"]
