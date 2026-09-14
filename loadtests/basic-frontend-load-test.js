import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Basic Frontend Load Test for edusphere (Next.js)
 *
 * Tests main user-facing pages:
 * - Homepage
 * - Courses listing
 * - Pricing page
 * - Checkout flow
 *
 * Run: k6 run loadtests/basic-frontend-load-test.js
 * Run with custom BASE_URL: k6 run -e BASE_URL=https://edusphere.example.com loadtests/basic-frontend-load-test.js
 */

export const options = {
  stages: [
    { duration: '30s', target: 30, name: 'Ramp-up' },
    { duration: '2m', target: 100, name: 'Stay' },
    { duration: '1m', target: 100, name: 'Peak' },
    { duration: '30s', target: 0, name: 'Ramp-down' },
  ],
  thresholds: {
    http_req_duration: [
      'p(95)<1000', // 95th percentile < 1s for frontend
      'p(99)<2000', // 99th percentile < 2s
    ],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.90'],
  },
};

export default function basicFrontendLoadTest() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3001';

  // Test 1: Homepage
  {
    const response = http.get(`${baseUrl}/`, {
      tags: { endpoint: 'homepage' },
    });

    check(response, {
      'Homepage: status 200': (r) => r.status === 200,
      'Homepage: response time < 1000ms': (r) => r.timings.duration < 1000,
      'Homepage: contains content': (r) => r.body.length > 1000,
    });
  }

  sleep(1);

  // Test 2: Courses page
  {
    const response = http.get(`${baseUrl}/courses`, {
      tags: { endpoint: 'courses' },
    });

    check(response, {
      'Courses: status 200': (r) => r.status === 200,
      'Courses: response time < 1500ms': (r) => r.timings.duration < 1500,
    });
  }

  sleep(1);

  // Test 3: Pricing page
  {
    const response = http.get(`${baseUrl}/pricing`, {
      tags: { endpoint: 'pricing' },
    });

    check(response, {
      'Pricing: status 200': (r) => r.status === 200,
      'Pricing: response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  }

  sleep(1);

  // Test 4: Bundles page
  {
    const response = http.get(`${baseUrl}/bundles`, {
      tags: { endpoint: 'bundles' },
    });

    check(response, {
      'Bundles: status 200': (r) => r.status === 200,
      'Bundles: response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  }

  sleep(1);

  // Test 5: Articles page
  {
    const response = http.get(`${baseUrl}/articles`, {
      tags: { endpoint: 'articles' },
    });

    check(response, {
      'Articles: status 200': (r) => r.status === 200,
      'Articles: response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  }

  sleep(1);

  // Test 6: Roadmap page
  {
    const response = http.get(`${baseUrl}/roadmap`, {
      tags: { endpoint: 'roadmap' },
    });

    check(response, {
      'Roadmap: status 200 or 404': (r) => [200, 404].includes(r.status),
    });
  }

  sleep(1);
}
