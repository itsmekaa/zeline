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

    m.react(config.emoji)

    try {
      const time = moment().tz(config.tz).format('HH:mm')

      const res = await axios.get(
        `${config.api.baseUrl.zeline}/api/canvas/iqc`,
        {
          params: { text, time, key: config.api.key.zeline },
          responseType: 'arraybuffer'
        }
      )

      await m.reply({
        image: Buffer.from(res.data)
      })

    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
