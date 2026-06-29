import axios from 'axios'

export const run = {
  cmd: ['brat'],
  category: 'creativity',
  run: async (m, { sock, text, prefix, command }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, 'hello world'))
    }

    try {
      const { data: media } = await axios.get(
        'https://skyzxu-brat.hf.space/brat?text=' +
          encodeURIComponent(text),
        {
          responseType: 'arraybuffer'
        }
      )

      sock.sendSticker(m.chat, media, {
        packname: config.sticker.packname,
        author: config.sticker.author,
        ai: true,
        quoted: m
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
