db.event ??= {}
db.event.tiktokSearch ??= {}

export const run = {
  cmd: ['tiktoksearch'],
  hidden: ['tts'],
  category: 'search',
  run: async (m, { text, command, prefix }) => {
    try {
      if (!text) {
        return m.reply(Func.usage(prefix, command, 'video cinematic'))
      }

      const data = await Func.fetchJson(`${config.api.baseUrl.zeline}/api/search/tiktok?keywords=${encodeURIComponent(text)}&key=${config.api.key.zeline}`)

      const videos = data?.results?.results || []

      if (!videos.length) {
        return m.reply('Video tidak ditemukan')
      }

      db.event.tiktokSearch[m.sender] = {
        videos: videos.slice(0, 10),
        expired: Date.now() + 60000
      }

      let caption = `#> TikTok Search\n`
      caption += `- query : ${text}\n`
      caption += `- result : ${Math.min(videos.length, 10)}\n\n`
      caption += `#> Result Metadata\n`

      videos.slice(0, 10).forEach((v, i) => {
        caption += `${i + 1}.\n`
        caption += `- title : ${(v.title || '-').slice(0, 80)}\n`
        caption += `- author : ${v.author?.nickname || '-'}\n`
        caption += `- views : ${Func.h2k(v.stats?.play || 0)}\n\n`
      })

      caption += `Kirim angka 1 - ${Math.min(videos.length, 10)} untuk download video.\n`
      caption += `Expired dalam 1 menit.`

      await m.reply(caption.trim())
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
