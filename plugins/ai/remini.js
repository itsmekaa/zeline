export const run = {
  cmd: ['remini'],
  hidden: ['upscale', 'hd'],
  category: 'ai',
  run: async (m, { prefix, command }) => {
    if (
      !(
        m.type === 'imageMessage' ||
        (m.quoted && m.quoted.type === 'imageMessage')
      )
    ) {
      return m.reply(Func.usage(prefix, command, '(reply / send image)'))
    }

    m.react(config.emoji) 

    try {
      const media =
        m.quoted && m.quoted.type === 'imageMessage'
          ? m.quoted
          : m

      const buffer = await media.download()
      const enhanced = await scrape.enhance(buffer, 'medium')

      await m.reply({
        image: enhanced
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
