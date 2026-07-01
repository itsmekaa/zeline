import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'

if (!globalThis.cmdQueues) {
  globalThis.cmdQueues = new Map()
}

export const handler = async (sock, m) => {
  try {
    if (!m.message) return

    const msg = await serialize(m, sock)

    await db.init(msg)
    logger(msg)

    if (!global.db.plugins) {
      global.db.plugins = {}
    }

    if (global.db.settings.autoread) {
      await sock.readMessages([msg.key])
    }

    for (const [, plugin] of globalThis.plugins.entries()) {
      if (typeof plugin.event === 'function') {
        const stop = await plugin.event(msg, { sock })
        if (stop) return
      }
    }

    if (!msg.command) return
    if (global.db.settings.self && !msg.isOwner) return

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
      const isCmd = plugin?.cmd?.includes(msg.command)
      const isHidden = plugin?.hidden?.includes(msg.command)

      if (!isCmd && !isHidden) continue

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
        const pluginName = pluginPath.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')
        const shouldTrack = !plugin?.settings?.owner
        const isStats = pluginName === 'stats'

        if (shouldTrack && !isStats) {
          if (!global.db.plugins[pluginName]) {
            global.db.plugins[pluginName] = {
              total: 0,
              success: 0,
              error: 0,
              firstUsed: Date.now(),
              lastUsed: Date.now()
            }
          }

          global.db.plugins[pluginName].total++
          global.db.plugins[pluginName].lastUsed = Date.now()
        }

        let ok = false

        try {
          await plugin.run(msg, {
            sock,
            prefix: msg.prefix,
            command: msg.command,
            text: msg.args.join(' '),
            args: msg.args
          })
          ok = true
        } catch (error) {
          console.error(error)
          msg.reply(config.msg.error)
        } finally {
          if (shouldTrack && !isStats && global.db.plugins[pluginName]) {
            if (ok) {
              global.db.plugins[pluginName].success++
            } else {
              global.db.plugins[pluginName].error++
            }
          }
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
        await executeCmd()
      }

      break
    }
  } catch (error) {
    console.error(error)
  }
}
