export const run = {
  cmd: ['toimage'],
  hidden: ['toimg'],
  category: 'tools',
  usage: 'reply sticker',
  run: async (m, { prefix, command }) => {

    if (
      !m.quoted &&
      !m.message?.stickerMessage
    ) {
      return m.reply(Func.usage(prefix, command, '(reply sticker)'))
    }

    try {
      const msg = m.quoted ? m.quoted : m
      const mime = msg.type || ''

      if (!/sticker/.test(mime)) {
        return
      }

      const buffer = await msg.download()

      await m.reply({
        image: buffer
      })

    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}
