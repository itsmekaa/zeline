export const run = {
  cmd: ['tiktok'],
  hidden: ['tt', 'ttdl'],
  category: 'downloader',
  run: async (ctx, { sock, text }) => {

    if (!text) {
      return ctx.reply(`# Cara penggunaan\n> *${ctx.prefix + 'tiktok'} https://vt.tiktok.com/xxxx*`)
    }

    const extractUrl = (input) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const found = input.match(urlRegex)
      return found ? found[0] : null
    }

    const url = extractUrl(text)
    if (!url || !url.includes("tiktok.com")) {
      return ctx.reply(`# Cara penggunaan\n> *${ctx.prefix + 'tiktok'} https://vt.tiktok.com/xxxx*`)
    }

    const fetchJson = async (link) => {
      const res = await fetch(link)
      return res.json()
    }

    const download = async (target) => {
      return fetchJson(`https://tikwm.com/api/?url=${encodeURIComponent(target)}`)
    }

    ctx.reply(config.msg.wait)

    try {
      const result = await download(url)

      if (!result.data) {
        return ctx.reply(config.msg.error)
      }

      const data = result.data

      const caption =
        `#> TikTok Download\n` +
        `- title : ${data.title || ''}\n` +
        `- author : ${data.author?.nickname || ''}\n` +
        `- region : ${data.region || '-'}\n` +
        `- views : ${Func.h2k(data.play_count)}\n` +
        `- likes : ${Func.h2k(data.digg_count)}\n` +
        `- comment : ${Func.h2k(data.comment_count)}`

      if (data.images && data.images.length) {
        if (data.images.length > 1) {
          await sock.sendAlbum(ctx.chat, data.images, { caption, delay: 1000, quoted: ctx })
        } else {
          await ctx.reply({
            image: { url: data.images[0] },
            caption
          })
        }
      } else {
        await ctx.reply({
          video: {
            url: data.play
          },
          caption
        })
      }

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
