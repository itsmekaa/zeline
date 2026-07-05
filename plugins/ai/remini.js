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
      const media = m.quoted && m.quoted.type === 'imageMessage' ? m.quoted : m
      
      const buffer = await media.download()
      const imageUrl = await uploader.uguu(buffer)
      const remini = await Func.fetchBuffer(`${config.api.baseUrl.skyzxu}/api/ai/remini?url=${imageUrl}&key=${config.api.key.skyzxu}`)

      await m.reply({
        image: remini
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
