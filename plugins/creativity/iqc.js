import axios from 'axios'
import moment from 'moment-timezone'

export const run = {
  cmd: ['iqc'],
  hidden: ['iphonequoted'],
  category: 'creativity',
  run: async (m, { text, prefix, command }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, 'kelaz kink'))
    }

    await m.reply(config.msg.wait)

    try {
      const time = moment().tz(config.tz).format('HH:mm')

      const res = await axios.get(
        `${config.api.baseUrl.skyzxu}/api/iqc`,
        {
          params: { text, time },
          responseType: 'arraybuffer'
        }
      )

      await m.reply({
        image: Buffer.from(res.data)
      })

    } catch (e) {
      console.log(e.message)
      m.reply(config.msg.error)
    }
  }
}
