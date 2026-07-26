export const run = {
  cmd: ['bratvid'],
  hidden: ['bratvideo'],
  category: 'creativity',
  usage: 'text',
  run: async (m, { sock, text, prefix, command }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'hello world'))

    try {
      await sock.sendSticker(
        m.chat,
        await Func.fetchBuffer(
          `https://skyzxu-brat.hf.space/brat-animated?text=${encodeURIComponent(text)}`
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
