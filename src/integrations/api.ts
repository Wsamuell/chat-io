export async function callGPTAPI(data: object) {
  const res = await fetch('', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      body: JSON.stringify(data),
      Authorization: `Bearer ${Bun.env.OPENAPI_API_KEY}`,
    },
  });
  return res;
}
