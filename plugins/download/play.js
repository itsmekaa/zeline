export const run = {
  cmd: ['play'],
  category: 'downloader',
  run: async (ctx, { sock, text }) => {

    if (!text) {
      return ctx.reply(`# Cara penggunaan\n> *${ctx.prefix + 'play'} multo*`)
    }

    ctx.reply(config.msg.wait)

    try {
      const result = await Func.fetchJson(`https://skyzxu.my.id/api/playmusic?query=${encodeURIComponent(text)}`)

      if (!result.success || !result.results) {
        throw new Error('Not Found or API Error')
      }

      const { metadata, download } = result.results
      const fileSizeMB = (download.filesize / (1024 * 1024)).toFixed(2)

      const caption =
        `#> YouTube Music\n` +
        `- title : ${metadata.title || ''}\n` +
        `- uploader : ${metadata.uploader || ''}\n` +
        `- duration : ${Func.toDate(metadata.duration)}\n` +
        `- views : ${Func.h2k(metadata.view_count)}\n` +
        `- likes : ${Func.h2k(metadata.like_count)}\n` +
        `- size : ${fileSizeMB} MB`

      await ctx.reply({
        image: { url: metadata.thumbnail },
        caption
      })

      await ctx.reply({
        audio: { url: download.download_url },
        mimetype: 'audio/mpeg',
        fileName: `${metadata.title}.mp3`,
        ptt: false
      })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
