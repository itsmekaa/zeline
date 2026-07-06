export const run = {
  cmd: ['pinterest'],
  hidden: ['pin'],
  category: 'download',
  run: async (m, { prefix, command, sock, text }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, '(send query / url)'))
    }

    m.react(config.emoji)

    const isUrl = Func.validUrl(text, 'pin.it') || Func.validUrl(text, 'pinterest.com')

    try {
      if (isUrl) {
        const json = await Func.fetchJson(`${config.api.baseUrl.zeline}/api/downloader/pinterest?url=${encodeURIComponent(text)}&key=${config.api.key.zeline}`)

        const result = json.results
        const mediaList = result.media

        const caption =
          `#> Pinterest Download\n` +
          `- title : ${result.title || '-'}\n` +
          `- author : ${result.author || 'unknown'}\n` +
          `- media : ${mediaList.length}`

        if (mediaList.length > 1) {
          const urls = mediaList.map(v => v.url)

          await sock.sendAlbum(m.chat, urls, {
            caption,
            delay: 1000,
            quoted: m
          })
        } else {
          const type = mediaList[0].type === 'video' ? 'video' : 'image'

          await m.reply({
            [type]: { url: mediaList[0].url },
            caption
          })
        }
      } else {
        const json = await Func.fetchJson(`${config.api.baseUrl.zeline}/api/search/pinterest?query=${encodeURIComponent(text)}&key=${config.api.key.zeline}`)

        if (!json.results?.data?.length) {
          return m.reply('No results found.')
        }

        const data = json.results.data.slice(0, 4)
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
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
