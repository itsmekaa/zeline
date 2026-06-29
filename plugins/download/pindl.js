export const run = {
  cmd: ['pindl'],
  hidden: ['pinterestdownload', 'pind'],
  category: 'download',
  run: async (m, { prefix, command, sock, text }) => {
    if (
      !text ||
      (!Func.validUrl(text, 'pin.it') &&
       !Func.validUrl(text, 'pinterest.com'))
    ) {
      return m.reply(Func.usage(prefix, command, 'https://pin.it/3tzPdhOHI'))
    }

    m.react(config.emoji)

    try {
      const result = await scrape.pindl(text)
      const media = result.media.map(v => v.url)

      const caption =
        `#> Pinterest Download\n` +
        `- title : ${result.title || '-'}\n` +
        `- author : ${result.author || 'unknown'}\n` +
        `- media : ${media.length}`

      if (media.length > 1) {
        await sock.sendAlbum(m.chat, media, {
          caption,
          delay: 1000,
          quoted: m
        })
      } else {
        const type = result.media[0].type === 'video' ? 'video' : 'image'

        await m.reply({
          [type]: { url: media[0] },
          caption
        })
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
