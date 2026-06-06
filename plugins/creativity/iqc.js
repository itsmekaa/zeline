import axios from 'axios'

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
      const hasImage =
        ctx.type === 'imageMessage' ||
        (ctx.quoted && ctx.quoted.type === 'imageMessage')

      const now = new Date()
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
      const time = `${String(wib.getUTCHours()).padStart(2, '0')}:${String(wib.getUTCMinutes()).padStart(2, '0')}`

      let data

      if (hasImage) {
        const media = ctx.type === 'imageMessage' ? ctx : ctx.quoted
        const buffer = await media.download()
        const imageUrl = await uploader.skyzxu(buffer)

        const body = {
          sender: 'other',
          message: text,
          timestamp: time,
          time,
          status: {
            carrierName: 'TELKOMSEL',
            batteryPercentage: 100,
            signalStrength: 4,
            wifi: true
          },
          backgroundUrl: '',
          readStatus: true,
          emojiStyle: 'apple',
          imageUrl
        }

        const res = await axios.post(
          'https://brat.siputzx.my.id/v2/iphone-quoted',
          body,
          { responseType: 'arraybuffer' }
        )

        data = res.data
      } else {
        const params = new URLSearchParams({
          messageText: text,
          time,
          carrierName: 'TELKOMSEL',
          batteryPercentage: 100,
          signalStrength: 4,
          emojiStyle: 'apple'
        })

        const res = await axios.get(
          `https://brat.siputzx.my.id/iphone-quoted?${params}`,
          { responseType: 'arraybuffer' }
        )

        data = res.data
      }

      const url = await uploader.skyzxu(Buffer.from(data))
      await ctx.reply({ image: { url } })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}