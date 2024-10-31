import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const url = 'http://localhost:3000/create-post';
  const payload = JSON.stringify({
    title: 'Test 10',
    desc: 'Desc',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Log response status and body
  console.log(`Response status: ${res.status}`);
  console.log(`Response body: ${res.body}`);

  // Only proceed to JSON parsing if the response is OK
  if (res.status === 200 && res.body) {
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.duration < 200,
      'title is correct': (r) => r.json().title === 'Test 10',
      'description is correct': (r) => r.json().desc === 'Desc',
    });
  } else {
    console.error(`Request failed or body is empty: ${res.status} ${res.body}`);
  }

  sleep(1);
}
