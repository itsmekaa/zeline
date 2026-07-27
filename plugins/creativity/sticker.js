export const run = {
  cmd: ['sticker'],
  hidden: ['s'],
  category: 'creativity',
  usage: 'send / reply media',
  run: async (m, { sock, prefix, command }) => {
    if (
      !m.quoted &&
      !m.message?.imageMessage &&
      !m.message?.videoMessage
    ) {
      return m.reply(
        Func.usage(prefix, command, '(reply / send media)')
      )
    }

    try {
      const msg = m.quoted || m
      const mime = msg.type || ''

      if (!/image|video/.test(mime)) {
        return m.reply('Supported type : *[ image, video ]*')
      }

      const media = await msg.download()

      await sock.sendSticker(m.chat, media, {
        packname: sticker.packname || '',
        author: sticker.author || '',
        ai: true,
        quoted: m
      })
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}
