import sharp from 'sharp'

export const run = {
  cmd: ['sticker'],
  hidden: ['stiker', 's', 'wm'],
  category: 'creativity',
  run: async (m, { prefix, command }) => {
    if (
      !m.quoted &&
      !m.message?.imageMessage &&
      !m.message?.videoMessage &&
      !m.message?.stickerMessage
    ) {
      return m.reply(
        '# Cara penggunaan\n> *buat sticker :* kirim atau balas foto/video/sticker dengan caption ' +
        prefix + command +
        '\n\n> *ubah watermark :* kirim atau balas foto/video/sticker dengan caption ' +
        prefix + command + ' text1 | text2'
      )
    }

    try {
      const msg = m.quoted ? m.quoted : m
      const mime = msg.type || ''

      if (!/image|video|sticker/.test(mime)) {
        return m.reply('❌ Hanya support gambar, video, atau sticker!')
      }

      let packname = config.sticker?.packname || ''
      let author = config.sticker?.author || ''

      const text = m.text.replace(prefix + command, '').trim()

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

      await m.reply({ sticker: buf })
    } catch (e) {
      console.log(e.message)
      m.reply(config.msg.error)
    }
  }
}
