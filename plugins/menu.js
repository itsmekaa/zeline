import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

const pkg = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), 'package.json'),
    'utf8'
  )
)

export const run = {
  cmd: ['menu'],
  hidden: ['m'],
  run: async (ctx) => {
    const categories = {}

    for (const [_, plugin] of globalThis.plugins.entries()) {
      if (plugin.category && plugin.cmd) {
        if (!categories[plugin.category]) categories[plugin.category] = []
        categories[plugin.category].push(...plugin.cmd)
      }
    }

    const time = moment().tz(config.tz).format('HH:mm:ss')

    let text = `Hi @${ctx.sender.split('@')[0]} !\n\n`
    text += '`Bot Info`\n'
    text += `- Name : ${pkg.name}\n`
    text += `- Prefix : [ ${config.prefix.join(', ')} ]\n`
    text += `- Time : ${time}\n\n`

    for (const cat in categories) {
      text += `\`${cat}\`\n`
      text += categories[cat]
        .sort()
        .map(cmd => `\`\`\`- ${ctx.prefix || config.prefix[0]}${cmd}\`\`\``)
        .join('\n')
      text += '\n\n'
    }

    await ctx.reply(text.trim(), {
      mentions: [ctx.sender]
    })
  }
}
