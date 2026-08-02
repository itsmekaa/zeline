export async function Api(path, params = {}) {
  const query = new URLSearchParams({ ...params, key: process.env.API_KEY })
  const url = `${process.env.API_ENDPOINT}${path}?${query.toString()}`
  const res = await fetch(url)
  return res.json()
}
