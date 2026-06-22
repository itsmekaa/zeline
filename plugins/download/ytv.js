export const run = {
  cmd: ['ytmp4'],
  hidden: ['ytv'],
  category: 'download',
  run: async (m, { text, prefix, command }) => {
    if (!text || !Func.validUrl(text, 'youtu.be')) {
      return m.reply(Func.usage(prefix, command, 'https://youtu.be/PrF3E-otC_E'))
    }

    m.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.skyzxu}/api/ytmp4?url=${encodeURIComponent(text)}`
      )

      if (!result.success || !result.results) {
        return m.reply(Func.jsonFormat(result))
      }

      const { metadata, download } = result.results

      if (metadata.duration > 3600) {
        return m.reply('❌ Durasi video lebih dari 60 menit.')
      }

      const caption =
        `#> YouTube Download\n` +
        `- title : ${metadata.title || ''}\n` +
        `- uploader : ${metadata.uploader || ''}\n` +
        `- duration : ${Func.toDate(metadata.duration)}\n` +
        `- views : ${Func.h2k(metadata.view_count)}\n` +
        `- likes : ${Func.h2k(metadata.like_count)}\n` +
        `- description : ${metadata.description || ''}`

      await m.reply({
        video: { url: download.download_url },
        mimetype: 'video/mp4',
        caption
      })

    } catch (e) {
      console.log(e.message)
      m.reply(config.msg.error)
    }
  }
}
