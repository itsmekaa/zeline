import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'
import chalk from 'chalk'
import { jidNormalizedUser } from 'baileys'

if (!globalThis.cmdQueues) {
  globalThis.cmdQueues = new Map()
}

export const handler = async (sock, m) => {
  try {
    if (!m.message) return

    const msg = await serialize(m, sock)

    await db.init(msg)
    logger(msg)

    if (global.db.settings.autoread) {
      await sock.readMessages([msg.key])
    }

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
      if (plugin && typeof plugin.event === 'function') {
        const isStop = await plugin.event(msg, { sock })
        if (isStop) return
      }
    }

    if (!msg.command) return

    if (global.db.settings.self && !msg.isOwner) return

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
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

        if (!globalThis.cmdQueues.has(pluginPath)) {
          globalThis.cmdQueues.set(pluginPath, {
            items: [],
            running: false,
            async process() {
              if (this.running || this.items.length === 0) return
              this.running = true
              const { task } = this.items.shift()
              try {
                await task()
              } catch (e) {
                console.error(e)
              }
              this.running = false
              this.process()
            }
          })
        }

        const queue = globalThis.cmdQueues.get(pluginPath)

        const executeCmd = async () => {
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
        }

        if (global.db.settings.antrian) {
          queue.items.push({ task: executeCmd })

          const position = queue.items.length + (queue.running ? 1 : 0)
          const isOwnerPrivilege = plugin?.settings?.owner || msg.isOwner

          if (position > 1 && !isOwnerPrivilege) {
            msg.reply(`[ ! ] Anda berada di antrian *#${position}*,\nMohon menunggu...`)
          }

          queue.process()
        } else {
          executeCmd()
        }

        break
      }
    }
  } catch (error) {
    console.error(error)
  }
}