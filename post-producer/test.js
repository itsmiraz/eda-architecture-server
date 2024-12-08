// import http from "k6/http";
// import { check, sleep } from "k6";

// export let options = {
//   vus: 1000,
//   duration: "60s",
//   cloud: {
//     projectID: "3721885",
//     name: "Eda Test",
//   },
// };

// export default function () {
//   const url = "http://localhost:3000/create-post";
//   const payload = JSON.stringify({
//     title: `Test- ${Math.random().toString()}`,
//     desc: "Desc",
//   });

//   const params = {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };

//   const res = http.post(url, payload, params);

//   // Log response status and body
//   console.log(`Response status: ${res.status}`);
//   console.log(`Response body: ${res.body}`);

//   // Only proceed to JSON parsing if the response is OK

//   sleep(1);
// }

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate('error_rate');
const requestDuration = new Trend('request_duration');

// Test options
export let options = {
  // Scenario 1: Spike Test
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },    // Ramp up quickly
        { duration: '30s', target: 2000 },   // Spike to very high load
        { duration: '1m', target: 2000 },    // Maintain high load
        { duration: '20s', target: 0 },      // Ramp down
      ],
    },
    constant_load: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '2m',
    },
    stress_test: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 1000,
      maxVUs: 3000,
      stages: [
        { duration: '30s', target: 100 },    // Normal load
        { duration: '30s', target: 200 },    // Increased load
        { duration: '30s', target: 500 },    // Heavy load
        { duration: '30s', target: 1000 },   // Extreme load
      ],
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Less than 10% of requests should fail
    error_rate: ['rate<0.1'],          // Custom error rate threshold
  }
};

// Helper function to generate random data
function generateRandomData() {
  const timestamp = new Date().getTime();
  return {
    title: `Test-${timestamp}-${Math.random().toString(36).substring(7)}`,
    desc: `Description for test ${Math.random().toString(36).substring(7)}`
  };
}

// Main test function
export default function () {
  const url = "http://localhost:3000/create-post";
  
  // Generate unique payload for each request
  const payload = JSON.stringify(generateRandomData());

  const params = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache",
      // Add a random request ID for tracking
      "X-Request-ID": `req-${Math.random().toString(36).substring(7)}`
    },
    timeout: '10s', // Increase timeout for high load scenarios
  };

  const startTime = new Date().getTime();
  
  try {
    const res = http.post(url, payload, params);
    const endTime = new Date().getTime();
    
    // Record response time
    requestDuration.add(endTime - startTime);

    // Comprehensive checks
    const checkRes = check(res, {
      'status is 200': (r) => r.status === 200,
      'response has data': (r) => r.body.length > 0,
      'response is json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
      'response time OK': (r) => r.timings.duration < 2000,
    });

    // Record error rate
    errorRate.add(!checkRes);

    // Log detailed information for failed requests
    if (!checkRes) {
      console.log(`
        Failed Request Details:
        - Status: ${res.status}
        - Duration: ${res.timings.duration}ms
        - Body: ${res.body}
        - Request ID: ${params.headers['X-Request-ID']}
      `);
    }

  } catch (e) {
    console.error(`Request failed: ${e.message}`);
    errorRate.add(1);
  }

  // Random sleep between 0.1 and 1 second to create more realistic load
  sleep(Math.random() * 0.9 + 0.1);
}

// Optional teardown function to log final statistics
export function teardown(data) {
  console.log('Test completed');
}