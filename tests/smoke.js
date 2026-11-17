import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 1, iterations: 1 };
export default function () {
  const response = http.get(`${__ENV.BASE_URL || 'http://localhost:3000'}/health`);
  check(response, { 'health responde 200': (r) => r.status === 200 });
}
