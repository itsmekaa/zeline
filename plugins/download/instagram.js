export const run = {
  cmd: ['instagram'],
  hidden: ['ig', 'igdl'],
  category: 'download',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'instagram.com')) {
      return m.reply(
        Func.usage(prefix, command, 'https://www.instagram.com/p/xxxx')
      )
    }

    m.react(config.emoji)

    try {
      const result = await Func.fetchJson(
        `${config.api.baseUrl.skyzxu}/api/downloader/ig?url=${encodeURIComponent(Func.extractUrl(text))}&key=${config.api.key.skyzxu}`
      )

      const media = result.results

      const caption =
        `#> Instagram Download\n` +
        `- media : ${media.length}`

      if (media.length > 1) {
        await sock.sendAlbum(
          m.chat,
          media.map(v => v.url),
          {
            caption,
            delay: 1000,
            quoted: m
          }
        )
      } else {
        const item = media[0]

        await m.reply(
          item.type === 'video'
            ? {
                video: { url: item.url },
                caption
              }
            : {
                image: { url: item.url },
                caption
              }
        )
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
