import axios from 'axios'

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

      const { data } = await axios.get(
        `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(text)}`
      )

      const videos = data?.data?.videos || []

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
        caption += `- views : ${Func.h2k(v.play_count || 0)}\n\n`
      })

      caption += `Kirim angka 1 - ${Math.min(videos.length, 10)} untuk download video.\n`
      caption += `Expired dalam 1 menit.`

      await m.reply(caption.trim())
    } catch (e) {
      console.error(e)
      m.reply(config.msg.error)
    }
  }
}
