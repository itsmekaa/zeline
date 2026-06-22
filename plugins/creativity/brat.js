import axios from 'axios'

export const run = {
  cmd: ['brat'],
  category: 'creativity',
  run: async (m, { text, prefix, command }) => {
    const usage = `# Cara penggunaan
> ${prefix + command} hai guys
> ${prefix + command} hai guys --image
> ${prefix + command} hai guys --animated --sticker
> ${prefix + command} hai guys --animated --video`

    const input = text || m.quoted?.text
    if (!input) return m.reply(usage)

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

      if (!cleanText) return m.reply(usage)

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

      if (flags.image) return m.reply({ image: media.data })

      if (flags.animated && flags.video) {
        return m.reply({
          video: media.data,
          mimetype: 'video/mp4'
        })
      }

      const stickerBuffer = await sticker.writeExif(media, {
        packName: config.sticker.packname,
        packPublish: config.sticker.author
      })

      return m.reply({ sticker: stickerBuffer })
    } catch (e) {
      console.log(e)
      return m.reply(config.msg.error)
    }
  }
}
