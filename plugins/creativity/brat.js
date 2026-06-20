import axios from 'axios'

export const run = {
  cmd: ['brat'],
  category: 'creativity',
  run: async (ctx, { text }) => {
    const usage = `# Cara penggunaan
> ${ctx.prefix + ctx.command} hai guys
> ${ctx.prefix + ctx.command} hai guys --image
> ${ctx.prefix + ctx.command} hai guys --animated --sticker
> ${ctx.prefix + ctx.command} hai guys --animated --video`

    const input = text || ctx.quoted?.text
    if (!input) return ctx.reply(usage)

    try {
      const flags = {
        animated: /--animated/i.test(input),
        image: /--image/i.test(input),
        video: /--video|\b-v\b/i.test(input),
        sticker: /--sticker|\b-s\b/i.test(input)
      }

      const cleanText = input
        .replace(/--animated/gi, '')
        .replace(/--image/gi, '')
        .replace(/--video|\b-v\b/gi, '')
        .replace(/--sticker|\b-s\b/gi, '')
        .trim()

      if (!cleanText) return ctx.reply(usage)

      const baseUrl = flags.animated
        ? 'https://skyzxu-brat.hf.space/brat-animated?text='
        : 'https://skyzxu-brat.hf.space/brat?text='

      const res = await axios.get(baseUrl + encodeURIComponent(cleanText), {
        responseType: 'arraybuffer'
      })

      const media = {
        data: res.data,
        mimetype: flags.animated ? 'video/mp4' : 'image/png',
        ext: flags.animated ? 'mp4' : 'png'
      }

      if (flags.image) return ctx.reply({ image: media.data })

      if (flags.animated && flags.video) {
        return ctx.reply({
          video: media.data,
          mimetype: 'video/mp4'
        })
      }

      const stickerBuffer = await sticker.writeExif(media, {
        packName: config.sticker.packname,
        packPublish: config.sticker.author
      })

      return ctx.reply({ sticker: stickerBuffer })
    } catch (e) {
      console.log(e)
      return ctx.reply(config.msg.error)
    }
  }
}
