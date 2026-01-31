// Lightweight dev worker that polls /api/status-queue/process with backoff
let failureCount = 0;

async function loop() {
  try {
    const res = await fetch('http://localhost:3000/api/status-queue/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 20 })
    });

    const json = await res.json();
    if (!res.ok || json?.error) {
      failureCount++;
      if (failureCount % 5 === 0) {
        console.error('Status worker error', json?.error ?? json);
      }
    } else {
      failureCount = 0;
    }
  } catch (_err) {
    failureCount++;
  }

  const delay = failureCount > 0 ? Math.min(15000, 3000 + failureCount * 1000) : 3000;
  setTimeout(loop, delay);
}

console.log('Dev worker running (adaptive polling)');
setTimeout(loop, 1500);