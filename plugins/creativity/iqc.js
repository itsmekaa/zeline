import moment from 'moment-timezone'

export const run = {
  cmd: ['iqc'],
  hidden: ['iphonequoted'],
  category: 'creativity',
  usage: 'text',
  run: async (m, { text, prefix, command }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'kelaz kink'))

    m.react(emoji)

    try {
      const res = await Api('/iqc', {
        text,
        time: moment().tz(tz).format('HH:mm')
      })

      await m.reply({ image: { url: res.results.url } })
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}