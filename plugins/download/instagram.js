export const run = {
  cmd: ['instagram'],
  hidden: ['ig', 'igdl'],
  category: 'download',
  run: async (ctx, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'instagram.com')) {
      return ctx.reply(Func.usage(prefix, command, 'https://www.instagram.com/p/xxxx'))
    }

    ctx.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.anabot}/api/download/instagram?url=${encodeURIComponent(Func.extractUrl(text))}&apikey=${config.api.key.anabot}`
      )

      if (!result?.success || !result?.data?.result?.length) {
        return ctx.reply(config.msg.error)
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
        await sock.sendAlbum(ctx.chat, media, {
          caption,
          delay: 1000,
          quoted: ctx
        })
      } else {
        const url = media[0]

        if (isVideo(url)) {
          await ctx.reply({
            video: { url },
            caption
          })
        } else {
          await ctx.reply({
            image: { url },
            caption
          })
        }
      }
    } catch (e) {
      console.log(e)
      ctx.reply(config.msg.error)
    }
  }
}
