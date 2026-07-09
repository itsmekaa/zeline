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
  run: async (m, { sock }) => {
    const categories = {}

    for (const [, plugin] of globalThis.plugins.entries()) {
      if (plugin.category && plugin.cmd) {
        if (!categories[plugin.category]) categories[plugin.category] = []
        categories[plugin.category].push(...plugin.cmd)
      }
    }

    const time = moment().tz(config.tz).format('HH:mm:ss')

    let text = `Hi @${m.sender.split('@')[0]} !\n\n`
    text += '`bot info`\n'
    text += `- name : ${pkg.name}\n`
    text += `- version : ${pkg.version}\n`
    text += `- prefix : [ ${config.prefix.join(', ')} ]\n`
    text += `- time : ${time}\n\n`

    for (const cat of Object.keys(categories).sort()) {
      text += `*- menu ${cat}*\n`

      const cmds = [...new Set(categories[cat])].sort()

      cmds.forEach((cmd, i) => {
        const last = i === cmds.length - 1
        text += `${last ? ' └' : ' │'} • ${m.prefix || config.prefix[0]}${cmd}\n`
      })

      text += '\n'
    }

    await sock.sendMessage(
      m.chat,
      {
        image: {
          url: 'media/image/icon.jpg'
        },
        caption: text.trim(),
        footer: pkg.name,
        offerText: pkg.version,
        offerCode: Func.createId(),
        offerExpiration: Date.now() + 3_600_000,
        nativeFlow: [],
        interactiveAsTemplate: false,
        mentions: [m.sender]
      },
      {
        quoted: m
      }
    )
  }
}
