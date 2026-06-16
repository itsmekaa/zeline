export const run = {
  cmd: ['ytmp3'],
  hidden: ['yta'],
  category: 'download',
  run: async (ctx, { text }) => {
    if (!text) {
      return ctx.reply(Func.usage(ctx.prefix, ctx.command, 'https://youtu.be/PrF3E-otC_E'))
    }

    if (!Func.validUrl(text)) {
      return ctx.reply(Func.usage(ctx.prefix, ctx.command, 'https://youtu.be/PrF3E-otC_E'))
    }

    ctx.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.skyzxu}/api/ytmp3?url=${encodeURIComponent(text)}`
      )

      if (!result.success || !result.results) {
        return ctx.reply(Func.jsonFormat(result))
      }

      const { metadata, download } = result.results

      if (metadata.duration > 3600) {
        return ctx.reply('❌ Durasi audio lebih dari 60 menit.')
      }

      const caption =
        `#> YouTube Download\n` +
        `- title : ${metadata.title || ''}\n` +
        `- uploader : ${metadata.uploader || ''}\n` +
        `- duration : ${Func.toDate(metadata.duration)}\n` +
        `- views : ${Func.h2k(metadata.view_count)}\n` +
        `- likes : ${Func.h2k(metadata.like_count)}\n` +
        `- description : ${metadata.description || ''}`

      await ctx.reply({
        image: { url: metadata.thumbnail },
        caption
      })

      await ctx.reply({
        audio: { url: download.download_url },
        mimetype: 'audio/mpeg',
        caption
      })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
