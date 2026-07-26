export const run = {
  cmd: ['brat'],
  category: 'creativity',
  usage: 'text',
  run: async (m, { sock, text, prefix, command }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'hello world'))

    try {
      await sock.sendSticker(
        m.chat,
        await Func.fetchBuffer(
          `https://skyzxu-brat.hf.space/brat?text=${encodeURIComponent(text)}`
        ),
        {
          packname: sticker.packname,
          author: sticker.author,
          ai: true,
          quoted: m
        }
      )
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}
