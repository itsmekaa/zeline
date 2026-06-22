import axios from 'axios'

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

    await m.reply(config.msg.wait)

    try {
      const media =
        m.quoted && m.quoted.type === 'imageMessage'
          ? m.quoted
          : m

      const buffer = await media.download()
      const up = await uploader.uguu(buffer)

      const api = `${config.api.baseUrl.anabot}/api/ai/toEnhance?imageUrl=${encodeURIComponent(up)}&apikey=freeApikey`
      const { data: result } = await axios.get(api)

      if (!result.success || !result.data?.result) {
        return m.reply(config.msg.error)
      }

      await m.reply({ image: { url: result.data.result } })

    } catch (e) {
      console.log(e.message)
      m.reply(config.msg.error)
    }
  }
}
