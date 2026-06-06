import axios from 'axios'

export const fetchJson = async (url, options = {}) => {
  const res = await axios({ method: 'GET', url, ...options })
  return res.data
}