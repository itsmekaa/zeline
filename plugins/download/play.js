export const run = {
  cmd: ['play'],
  category: 'download',
  usage: 'query',
  run: async (m, { prefix, command, text }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'multo'))

    m.react(emoji)

    try {
      const {
        results: { metadata, download }
      } = await Api('/playmusic', { query: text })

      await m.reply({
        image: { url: metadata.thumbnail },
        caption:
          `#> YouTube Music\n` +
          `- title : ${metadata.title || '-'}\n` +
          `- uploader : ${metadata.uploader || '-'}\n` +
          `- duration : ${Func.toDate(metadata.duration)}\n` +
          `- views : ${Func.h2k(metadata.view_count || 0)}\n` +
          `- likes : ${Func.h2k(metadata.like_count || 0)}\n` +
          `- size : ${Func.size(download.filesize || 0)}`
      })

      const sizeLimit =
        (Number(process.env.SIZE_LIMIT)) * 1024 * 1024

      const isDocument = download.filesize > sizeLimit

      await m.reply({
        [isDocument ? 'document' : 'audio']: {
          url: download.download_url
        },
        mimetype: 'audio/mpeg',
        fileName: `${metadata.title}.mp3`
      })
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}