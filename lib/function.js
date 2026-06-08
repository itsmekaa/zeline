export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const isUrl = (url) =>
  url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    )
  )

export const h2k = (integer) => {
  const numb = parseInt(integer)
  return new Intl.NumberFormat("en-US", {
    notation: "compact"
  }).format(numb)
}

export const toDate = (seconds) => {
  seconds = Math.floor(Number(seconds)) || 0

  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const result = []

  if (d) result.push(`${d}d`)
  if (h) result.push(`${h}h`)
  if (m) result.push(`${m}m`)
  if (s || result.length === 0) result.push(`${s}s`)

  return result.join(" ")
}

export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options)

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`)
  }

  return await res.json()
}