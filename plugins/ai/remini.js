import axios from 'axios'

export const run = {
  cmd: ['remini'],
  hidden: ['upscale', 'hd'],
  category: 'ai',
  run: async (m, { prefix, command }) => {
    if (
      !(m.type === 'imageMessage' || (m.quoted && m.quoted.type === 'imageMessage'))
    ) return m.reply(Func.usage(prefix, command, '(reply / send image)'))

    await m.reply(config.msg.wait)

    try {
      const media = m.quoted?.type === 'imageMessage' ? m.quoted : m
      const url = await uploader.uguu(await media.download())
      const { data } = await axios.get(
        `${config.api.baseUrl.skyzxu}/api/ai/enhance`,
        {
          params: { url, size: 'medium' },
          responseType: 'arraybuffer'
        }
      )

      await m.reply({ image: data })
    } catch (e) {
      console.error(e)
      m.reply(config.msg.error)
    }
  }
}
