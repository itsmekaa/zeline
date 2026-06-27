export const run = {
  cmd: ['ytmp3'],
  hidden: ['yta'],
  category: 'download',
  run: async (m, { text, prefix, command }) => {
    if (
      !text ||
      (!Func.validUrl(text, 'youtu.be') &&
       !Func.validUrl(text, 'youtube.com'))
    ) {
      return m.reply(Func.usage(prefix, command, 'https://youtu.be/PrF3E-otC_E'))
    }

    m.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.skyzxu}/api/ytmp3?url=${encodeURIComponent(text)}`
      )

      if (!result.success || !result.results) {
        return m.reply(Func.jsonFormat(result))
      }

      const { metadata, download } = result.results

      if (metadata.duration > 3600) {
        return m.reply('❌ Durasi audio lebih dari 60 menit.')
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
        image: { url: metadata.thumbnail },
        caption
      })

      await m.reply({
        audio: { url: download.download_url },
        mimetype: 'audio/mpeg',
        caption
      })

    } catch (e) {
      console.log(e.message)
      m.reply(config.msg.error)
    }
  }
}
