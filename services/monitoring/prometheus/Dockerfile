FROM prom/prometheus:v3.7.2

COPY prometheus.yaml /etc/prometheus/prometheus.yml
COPY rules.yaml /etc/prometheus/rules.yml

CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--web.external-url=http://localhost:8080/prometheus", \
     "--web.route-prefix=/prometheus"]
