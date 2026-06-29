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
        `https://tikwm.com/api/?url=${encodeURIComponent(Func.extractUrl(text))}`
      )

      if (!result?.data) {
        return m.reply(config.msg.error)
      }

      const data = result.data

      const caption =
        `#> TikTok Download\n` +
        `- title : ${data.title || ''}\n` +
        `- author : ${data.author?.nickname || ''}\n` +
        `- region : ${data.region || '-'}\n` +
        `- views : ${Func.h2k(data.play_count)}\n` +
        `- likes : ${Func.h2k(data.digg_count)}\n` +
        `- comment : ${Func.h2k(data.comment_count)}`

      if (data.images?.length) {
        if (data.images.length > 1) {
          await sock.sendAlbum(m.chat, data.images, {
            caption,
            delay: 1000,
            quoted: m
          })
        } else {
          await m.reply({
            image: { url: data.images[0] },
            caption
          })
        }
      } else {
        await m.reply({
          video: { url: data.play },
          caption
        })
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
