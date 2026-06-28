import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'

export const handler = async (sock, m) => {
  try {
    if (!m.message) return

    const msg = await serialize(m, sock)

    await db.init(msg)
    logger(msg)

    for (const [, plugin] of globalThis.plugins.entries()) {
      if (plugin && typeof plugin.event === 'function') {
        const isStop = await plugin.event(msg, { sock })
        if (isStop) return
      }
    }

    if (!msg.command) return

    if (global.db.settings.self && !msg.isOwner) return

    for (const [, plugin] of globalThis.plugins.entries()) {
      const isCmd = plugin?.cmd && plugin.cmd.includes(msg.command)
      const isHidden = plugin?.hidden && plugin.hidden.includes(msg.command)

      if (isCmd || isHidden) {
        if (plugin?.settings) {
          if (plugin.settings.owner && !msg.isOwner) return msg.reply(config.msg.owner)
          if (plugin.settings.group && !msg.isGroup) return msg.reply(config.msg.group)
          if (plugin.settings.private && msg.isGroup) return msg.reply(config.msg.private)

          if (msg.isGroup) {
            if (plugin.settings.admin && !msg.isAdmin) return msg.reply(config.msg.admin)
            if (plugin.settings.botAdmin && !msg.isBotAdmin) return msg.reply(config.msg.botAdmin)
          }
        }

        try {
          await plugin.run(msg, {
            sock,
            prefix: msg.prefix,
            command: msg.command,
            text: msg.args.join(' '),
            args: msg.args
          })
        } catch (error) {
          msg.reply(config.msg.error)
        }

        break
      }
    }
  } catch (error) {
    console.error(error)
  }
}
