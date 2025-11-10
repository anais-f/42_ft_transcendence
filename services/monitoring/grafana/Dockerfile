FROM grafana/grafana-oss:12.2.0-17142428006

WORKDIR /app

USER root

COPY ./entrypoint.sh /entrypoint.sh
COPY ./provisioning/ /etc/grafana/provisioning/
COPY ./dashboards/ /etc/grafana/dashboards/

RUN chmod +x /entrypoint.sh

USER 472

ENTRYPOINT ["/entrypoint.sh"]
