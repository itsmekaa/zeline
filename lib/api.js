export async function Api(path, params = {}) {
  const query = new URLSearchParams({ ...params, key: process.env.API_KEY })
  const res = await fetch(`${process.env.API_ENDPOINT}${path}?${query.toString()}`)

  if (!res.ok) {
    throw new Error(res.status)
  }

  return res.json()
}