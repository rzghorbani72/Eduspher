import http from 'k6/http';
import { check, group, sleep } from 'k6';

/**
 * User Journey Load Test for edusphere (Next.js)
 *
 * Simulates realistic user scenarios:
 * - Homepage → Course browsing → Course detail → Checkout
 * - Search functionality
 * - Article reading
 * - Account access
 *
 * Run: k6 run loadtests/user-journey-load-test.js
 * Run with custom BASE_URL: k6 run -e BASE_URL=https://edusphere.example.com loadtests/user-journey-load-test.js
 */

export const options = {
  vus: 40,
  duration: '4m',
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m30s', target: 40 },
    { duration: '1m', target: 40 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration{endpoint:static}': ['p(95)<500'],
    'http_req_duration{endpoint:dynamic}': ['p(95)<1500'],
    'http_req_failed': ['rate<0.1'],
    'checks': ['rate>0.85'],
  },
};

export default function() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3001';

  group('Scenario 1: Course Buyer Journey', () => {
    // 1. Land on homepage
    {
      const response = http.get(`${baseUrl}/`, {
        tags: { endpoint: 'static' },
      });

      check(response, {
        'Homepage loads': (r) => r.status === 200,
      });
    }
    sleep(2);

    // 2. Browse courses
    {
      const response = http.get(`${baseUrl}/courses`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Courses page loads': (r) => r.status === 200,
        'Courses page performance': (r) => r.timings.duration < 1500,
      });
    }
    sleep(2);

    // 3. View course detail (dynamic route)
    {
      const courseSlug = 'react-fundamentals';
      const response = http.get(`${baseUrl}/${courseSlug}`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Course detail loads or redirects': (r) => [200, 301, 404].includes(r.status),
      });
    }
    sleep(2);

    // 4. View pricing
    {
      const response = http.get(`${baseUrl}/pricing`, {
        tags: { endpoint: 'static' },
      });

      check(response, {
        'Pricing page loads': (r) => r.status === 200,
      });
    }
    sleep(1);

    // 5. Access checkout (may fail without session)
    {
      const response = http.get(`${baseUrl}/checkout`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Checkout loads or redirects': (r) => [200, 301, 302, 401].includes(r.status),
      });
    }
    sleep(1);
  });

  group('Scenario 2: Content Reader Journey', () => {
    // 1. Homepage
    {
      const response = http.get(`${baseUrl}/`, {
        tags: { endpoint: 'static' },
      });

      check(response, {
        'Homepage loads': (r) => r.status === 200,
      });
    }
    sleep(1);

    // 2. Read articles
    {
      const response = http.get(`${baseUrl}/articles`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Articles page loads': (r) => r.status === 200,
      });
    }
    sleep(2);

    // 3. View bundles
    {
      const response = http.get(`${baseUrl}/bundles`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Bundles page loads': (r) => r.status === 200,
      });
    }
    sleep(2);

    // 4. Check pricing again
    {
      const response = http.get(`${baseUrl}/pricing`, {
        tags: { endpoint: 'static' },
      });

      check(response, {
        'Pricing page loads': (r) => r.status === 200,
      });
    }
    sleep(1);
  });

  group('Scenario 3: Returning User', () => {
    // 1. Access account
    {
      const response = http.get(`${baseUrl}/account`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Account page loads or redirects': (r) => [200, 301, 302, 401].includes(r.status),
      });
    }
    sleep(1);

    // 2. Browse more courses
    {
      const response = http.get(`${baseUrl}/courses?sort=latest`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Filtered courses load': (r) => [200, 404].includes(r.status),
      });
    }
    sleep(1);

    // 3. View roadmap
    {
      const response = http.get(`${baseUrl}/roadmap`, {
        tags: { endpoint: 'dynamic' },
      });

      check(response, {
        'Roadmap loads or 404s': (r) => [200, 404].includes(r.status),
      });
    }
    sleep(1);
  });

  group('Static Asset Performance', () => {
    // Test multiple static endpoints in parallel-like fashion
    const staticPages = [
      { path: '/', name: 'Homepage' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/courses', name: 'Courses' },
    ];

    staticPages.forEach((page) => {
      const response = http.get(`${baseUrl}${page.path}`, {
        tags: { endpoint: 'static', page: page.name },
      });

      check(response, {
        [`${page.name}: loads fast`]: (r) => r.timings.duration < 1000,
      });

      sleep(0.5);
    });
  });

  sleep(1);
}
