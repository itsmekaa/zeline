export const run = {
  cmd: ['ytmp4'],
  hidden: ['ytv'],
  category: 'downloader',
  run: async (ctx, { text }) => {

    if (!text) {
      return ctx.reply(`# Cara penggunaan\n> *${ctx.prefix + 'ytmp4'} https://youtu.be/PrF3E-otC_E*`)
    }

    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i

    if (!ytRegex.test(text)) {
      return ctx.reply(`# Cara penggunaan\n> *${ctx.prefix + 'ytmp4'} https://youtu.be/PrF3E-otC_E*`)
    }

    ctx.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.skyzxu}/api/ytmp4?url=${encodeURIComponent(text)}`
      )

      if (!result.success || !result.results) {
        return ctx.reply(Func.jsonFormat(result))
      }

      const { metadata, download } = result.results

      if (metadata.duration > 3600) {
        return ctx.reply('❌ Durasi video lebih dari 60 menit.')
      }

      const caption =
        `#> YouTube Download\n` +
        `- title : ${metadata.title || ''}\n` +
        `- uploader : ${metadata.uploader || ''}\n` +
        `- duration : ${Func.toDate(metadata.duration)}\n` +
        `- views : ${Func.h2k(metadata.view_count)}\n` +
        `- likes : ${Func.h2k(metadata.like_count)}\n` +
        `- description : ${metadata.description}`

      await ctx.reply({
        video: { url: download.download_url },
        mimetype: 'video/mp4',
        caption
      })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
