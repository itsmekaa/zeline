export const run = {
  cmd: ['bratvid'],
  hidden: ['bratvideo'],
  category: 'creativity',
  description: 'text',
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
          packname: config.sticker.packname,
          author: config.sticker.author,
          ai: true,
          quoted: m
        }
      )
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
