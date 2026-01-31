// Run this script to process the status queue once
// Usage: node scripts/process-status-queue.js

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  try {
    const res = await fetch(`${baseUrl}/api/status-queue/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 100 })
    });
    const json = await res.json();
    console.log('Processed:', json);
    process.exit(0);
  } catch (err) {
    console.error('Error processing queue:', err);
    process.exit(1);
  }
})();
