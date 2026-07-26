export const run = {
  cmd: ['removebg'],
  hidden: ['rmbg', 'nobg'],
  category: 'ai',
  usage: 'reply / send image',
  run: async (m, { prefix, command }) => {
    if (!(m.type === 'imageMessage' || m.quoted?.type === 'imageMessage'))
      return m.reply(Func.usage(prefix, command, '(reply / send image)'))

    m.react(emoji)

    try {
      const media = m.quoted?.type === 'imageMessage' ? m.quoted : m
      const url = await uploader.uguu(await media.download())
      const res = await Api('/removebg', { url })

      await m.reply({ image: { url: res.results.url } })
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}