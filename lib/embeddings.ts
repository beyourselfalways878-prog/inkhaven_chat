const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string | undefined;

export async function computeEmbedding(input: string) {
  if (!OPENAI_API_KEY) return null;
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input })
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  return json?.data?.[0]?.embedding ?? null;
}
