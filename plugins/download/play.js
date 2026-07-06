export const run = {
  cmd: ['play'],
  category: 'download',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, 'multo'))
    }

    m.react(config.emoji)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/downloader/playmusic?query=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
      )

      if (result.code !== 200 || !result.results) {
        return m.reply(config.msg.error)
      }

      const { metadata, download } = result.results

      const caption =
        `#> YouTube Music\n` +
        `- title : ${metadata.title || '-'}\n` +
        `- uploader : ${metadata.uploader || '-'}\n` +
        `- duration : ${Func.toDate(metadata.duration)}\n` +
        `- views : ${Func.h2k(metadata.view_count || 0)}\n` +
        `- likes : ${Func.h2k(metadata.like_count || 0)}\n` +
        `- size : ${Func.size(download.filesize || 0)}`

      await m.reply({
        image: {
          url: metadata.thumbnail
        },
        caption
      })

      await m.reply({
        audio: {
          url: download.download_url
        },
        mimetype: 'audio/mpeg',
        fileName: `${metadata.title}.mp3`,
        ptt: false
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
