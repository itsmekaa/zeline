import sharp from 'sharp'

export const run = {
  cmd: ['sticker'],
  hidden: ['stiker', 's', 'wm'],
  category: 'creativity',
  run: async (ctx) => {
    if (
      !ctx.quoted &&
      !ctx.message?.imageMessage &&
      !ctx.message?.videoMessage &&
      !ctx.message?.stickerMessage
    ) {
      return ctx.reply(
        '# Cara penggunaan\n> *buat sticker :* kirim atau balas foto/video/sticker dengan caption ' +
        ctx.prefix + ctx.command +
        '\n\n> *ubah watermark :* kirim atau balas foto/video/sticker dengan caption ' +
        ctx.prefix + ctx.command + ' text1 | text2'
      )
    }

    try {
      const msg = ctx.quoted ? ctx.quoted : ctx
      const mime = msg.type || ''

      if (!/image|video|sticker/.test(mime)) {
        return ctx.reply('❌ Hanya support gambar, video, atau sticker!')
      }

      let packname = config.sticker?.packname || ''
      let author = config.sticker?.author || ''

      const text = ctx.text.replace(ctx.prefix + ctx.command, '').trim()

      if (text) {
        if (text.includes('|')) {
          let [p, a] = text.split('|')
          packname = p?.trim() || ''
          author = a?.trim() || ''
        } else {
          packname = text.trim()
          author = ''
        }
      }

      let buffer = await msg.download()

      if (/image/.test(mime)) {
        buffer = await sharp(buffer)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp()
          .toBuffer()
      }

      const media = {
        data: buffer,
        mimetype: mime.includes('sticker') ? 'image/webp' : mime,
        ext: mime.includes('sticker') ? 'webp' : mime.split('/')[1]
      }

      const buf = await sticker.writeExif(media, {
        packName: packname,
        packPublish: author
      })

      await ctx.reply({ sticker: buf })
    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
