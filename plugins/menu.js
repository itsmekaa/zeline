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
  run: async (m) => {
    const categories = {}

    for (const [, plugin] of globalThis.plugins.entries()) {
      if (plugin.category && plugin.cmd) {
        if (!categories[plugin.category]) categories[plugin.category] = []
        categories[plugin.category].push(...plugin.cmd)
      }
    }

    const time = moment().tz(config.tz).format('HH:mm:ss')

    let text = `Hi @${m.sender.split('@')[0]} !\n\n`
    text += '`Bot Info`\n'
    text += `- Name : ${pkg.name}\n`
    text += `- Prefix : [ ${config.prefix.join(', ')} ]\n`
    text += `- Time : ${time}\n\n`

    for (const cat of Object.keys(categories).sort()) {
      text += `*- menu ${cat}*\n`

      const cmds = [...new Set(categories[cat])].sort()

      cmds.forEach((cmd, i) => {
        const last = i === cmds.length - 1
        text += `${last ? ' └' : ' │'} • ${m.prefix || config.prefix[0]}${cmd}\n`
      })

      text += '\n'
    }

    await m.reply(text.trim(), {
      mentions: [m.sender]
    })
  }
}
