// Simple integration test assuming local dev server is running
(async () => {
  const messageId = 1; // ensure a message exists with this id
  const userId = 'test-user-1';
  const reaction = '👍';

  // Toggle on
  let res = await fetch('http://localhost:3000/api/reactions/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, userId, reaction }) });
  console.log('Toggle ON status', res.status);
  console.log(await res.json());

  // Toggle off
  res = await fetch('http://localhost:3000/api/reactions/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, userId, reaction }) });
  console.log('Toggle OFF status', res.status);
  console.log(await res.json());
})();