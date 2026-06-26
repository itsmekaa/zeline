export const run = {
  cmd: ['pinterest'],
  hidden: ['pin', 'pins'],
  category: 'search',
  run: async (m, { prefix, command, sock, text }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, 'wallpaper'))
    }

    m.reply(config.msg.wait)

    try {
      const results = await scrape.pinterest(text)

      if (!results?.length) {
        return m.reply('Tidak ada hasil ditemukan.')
      }

      const data = results.slice(0, 4)
      const images = data.map(v => v.image)

      const metadata = data.map((v, i) =>
        `${i + 1}.\n- title : ${v.title || '-'}\n- author : ${v.upload_by || 'unknown'}\n- time : ${v.upload_date}`
      ).join('\n\n')

      const caption =
        `#> Pinterest Search\n` +
        `- query : ${text}\n` +
        `- result : ${data.length}\n\n` +
        `#> Result Metadata\n` +
        metadata

      if (images.length > 1) {
        await sock.sendAlbum(m.chat, images, {
          caption,
          delay: 1000,
          quoted: m
        })
      } else {
        await m.reply({
          image: { url: images[0] },
          caption
        })
      }
    } catch (e) {
      console.log(e)
      m.reply(config.msg.error)
    }
  }
}
