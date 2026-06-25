import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000';

async function measureLatency(urlPath, method = 'GET', body = null) {
  const start = performance.now();
  const options = { method };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${urlPath}`, options);
  await res.text(); // Consume body
  const end = performance.now();
  return { duration: end - start, status: res.status };
}

async function runBenchmark() {
  console.log('⚡ Starting BeautyX API Performance Latency Audit...\n');
  
  const endpoints = [
    { name: 'Health Check (GET /health)', path: '/health', method: 'GET' },
    { name: 'Get Products (GET /api/products)', path: '/api/products', method: 'GET' },
    { name: 'Mock Login (POST /api/auth/login)', path: '/api/auth/login', method: 'POST', body: { email: 'bademail@beautyx.com', password: '123' } }
  ];

  for (const endpoint of endpoints) {
    console.log(`Auditing: ${endpoint.name}`);
    let totalDuration = 0;
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const result = await measureLatency(endpoint.path, endpoint.method, endpoint.body);
      totalDuration += result.duration;
      console.log(`  - Iteration ${i + 1}: ${result.duration.toFixed(2)} ms (Status: ${result.status})`);
    }
    
    const average = totalDuration / iterations;
    console.log(`👉 Average Latency for ${endpoint.name}: \x1b[36m${average.toFixed(2)} ms\x1b[0m\n`);
  }
  
  console.log('✅ Performance audit complete!');
  process.exit(0);
}

runBenchmark();
