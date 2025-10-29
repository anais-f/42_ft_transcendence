import { Counter, Gauge, Histogram } from 'prom-client';

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const
});

export const activeUsersGauge = new Gauge({
  name: 'active_users',
  help: 'Number of active users currently online'
});

export const dbQueryDurationGauge = new Gauge({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds'
});

export const responseTimeHistogram = new Histogram({
  name: 'http_response_time_seconds',
  help: 'Histogram of HTTP response times in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.001, 0.003, 0.005, 0.007, 0.01, 0.02, 0.05, 0.1, 0.5, 1]
});
