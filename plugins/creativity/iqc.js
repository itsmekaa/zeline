import axios from 'axios'
import moment from 'moment-timezone'

export const run = {
  cmd: ['iqc'],
  hidden: ['iphonequoted'],
  category: 'creativity',
  run: async (ctx, { text }) => {
    if (!text) {
      return ctx.reply(`# Cara penggunaan\n> ${ctx.prefix + ctx.command} kelaz kink`)
    }

    await ctx.reply(config.msg.wait)

    try {
      const time = moment().tz(config.tz).format('HH:mm')

      const res = await axios.get(
        `${config.api.baseUrl.skyzxu}/api/iqc`,
        {
          params: { text, time },
          responseType: 'arraybuffer'
        }
      )

      await ctx.reply({
        image: Buffer.from(res.data)
      })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
