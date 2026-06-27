import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

export const pindl = async (url) => {
  try {
    const { stdout } = await exec('curl', [
      '-s',
      '-G',
      'https://pindl.directget.online/get-info',
      '--data-urlencode',
      `url=${url}`,
      '--data-urlencode',
      'token=aYUhSMGNITTZMeTl3YVc0dWFYUXZNM1I2VUdSb1QwaEo=',
      '-H',
      'Cf-App-Key: aHR0cHM6Ly93d3cucGluZmxpay5jb20v'
    ])

    const { success, data } = JSON.parse(stdout)

    if (!success) throw new Error('Gagal mengambil data')

    return {
      title: data.title,
      author: data.author,
      type: data.type,
      media:
        data.type === 'carousel'
          ? data.items.map(v => ({
              type: v.type,
              url: v.url
            }))
          : [
              {
                type: data.type,
                url: data.url
              }
            ]
    }
  } catch (e) {
    throw new Error(e.message)
  }
}
