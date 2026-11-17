import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    checks: ['rate==1'],
    http_req_failed: ['rate==0'],
    'http_req_duration{endpoint:tasks}': ['p(95)<300']
  }
};
export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const response = http.get(`${baseUrl}/health`, { tags: { endpoint: 'health' } });
  check(response, { 'health responde 200': (r) => r.status === 200 });
  const tasks = http.get(`${baseUrl}/tasks`, { tags: { endpoint: 'tasks' } });
  check(tasks, {
    'tasks responde 200': (r) => r.status === 200,
    'tasks retorna uma lista': (r) => {
      try { return Array.isArray(r.json()); } catch { return false; }
    }
  });
  sleep(0.2);
}
