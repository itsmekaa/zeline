export const run = {
  cmd: ['tiktok'],
  hidden: ['tt', 'ttdl'],
  category: 'download',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'tiktok.com')) {
      return m.reply(Func.usage(prefix, command, 'https://vt.tiktok.com/ZSQqVxbbM/'))
    }

    m.react(config.emoji)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/downloader/tiktok?url=${encodeURIComponent(Func.extractUrl(text))}&key=${config.api.key.zeline}`
      )

      const data = result.results

      const caption =
        `#> TikTok Download\n` +
        `- title : ${data.title || ''}\n` +
        `- author : ${data.author?.nickname || ''}\n` +
        `- region : ${data.region || '-'}\n` +
        `- views : ${Func.h2k(data.stats?.play || 0)}\n` +
        `- likes : ${Func.h2k(data.stats?.like || 0)}\n` +
        `- comment : ${Func.h2k(data.stats?.comment || 0)}`

      if (data.type === 'slide') {
        const images = data.media.filter(v => v.type === 'image').map(v => v.url)
        
        if (images.length > 1) {
          await sock.sendAlbum(m.chat, images, {
            caption,
            delay: 1000,
            quoted: m
          })
        } else {
          await m.reply({
            image: { url: images[0] },
            caption
          })
        }
      } else {
        const video = data.media.find(v => v.type === 'video')
        
        await m.reply({
          video: { url: video.url },
          caption
        })
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
