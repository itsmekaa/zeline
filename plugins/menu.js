import moment from 'moment-timezone'

export const run = {
  cmd: ['menu'],
  hidden: ['m'],
  category: 'tools',
  run: async (ctx) => {
    const categories = {}
    
    for (const [_, plugin] of globalThis.plugins.entries()) {
      if (plugin.category && plugin.cmd) {
        if (!categories[plugin.category]) categories[plugin.category] = []
        categories[plugin.category].push(...plugin.cmd)
      }
    }

    const time = moment().tz(config.tz).format('HH:mm:ss')
    let text = `Hi *${ctx.pushName}* 👋\n\n`
    text += `◦ Prefix : [ ${config.prefix.join(', ')} ]\n`
    text += `◦ Time : ${time}\n\n`

    for (const cat in categories) {
      text += `*[ ${cat.toUpperCase()} ]*\n`
      text += categories[cat].map(cmd => `◦ ${ctx.prefix || config.prefix[0]}${cmd}`).join('\n')
      text += '\n\n'
    }

    ctx.reply(text.trim())
  }
}