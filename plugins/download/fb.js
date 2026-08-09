export const run = {
  cmd: ['facebook'],
  hidden: ['fb', 'fbdl'],
  category: 'download',
  usage: 'url',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'facebook.com'))
      return m.reply(
        Func.usage(prefix, command, 'https://www.facebook.com/share/p/xxxx')
      )

    m.react(emoji)

    try {
      const { results } = await Api('/fb', { url: Func.extractUrl(text, 'facebook.com')})

      const caption = `#> Facebook Download\n- media : ${results.length}`

      if (results.length > 1)
        return sock.sendAlbum(
          m.chat,
          results.map(({ url }) => url),
          {
            caption,
            delay: 1000,
            quoted: m
          }
        )

      const { type, url } = results[0]

      await m.reply({
        [type]: { url },
        caption
      })
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}
