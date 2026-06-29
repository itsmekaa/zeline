export const run = {
  cmd: ['instagram'],
  hidden: ['ig', 'igdl'],
  category: 'download',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'instagram.com')) {
      return m.reply(Func.usage(prefix, command, 'https://www.instagram.com/p/xxxx'))
    }

    m.react(config.emoji)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.anabot}/api/download/instagram?url=${encodeURIComponent(Func.extractUrl(text))}&apikey=${config.api.key.anabot}`
      )

      if (!result?.success || !result?.data?.result?.length) {
        return m.reply(config.msg.error)
      }

      const data = result.data.result

      const caption =
        `#> Instagram Download\n` +
        `- total : ${data.length}`

      const media = data.map(v => v.url).filter(Boolean)

      const isVideo = (url) => {
        return /\.mp4(\?|$)/i.test(url) || url.includes('video')
      }

      if (media.length > 1) {
        await sock.sendAlbum(m.chat, media, {
          caption,
          delay: 1000,
          quoted: m
        })
      } else {
        const url = media[0]

        if (isVideo(url)) {
          await m.reply({
            video: { url },
            caption
          })
        } else {
          await m.reply({
            image: { url },
            caption
          })
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
