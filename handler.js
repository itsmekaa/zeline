import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'
import { getOrCreateQueue } from './core/queue.js'
import { checkPermissions } from './core/permissions.js'
import { executeCommand } from './core/executor.js'

export const handler = async (sock, data) => {
  try {
    if (data.message) {
      const msg = await serialize(data, sock)
      await db.init(msg)
      logger(msg)
      if (!db.plugins) {
        db.plugins = {}
      }
      if (db.settings.autoread) {
        await sock.readMessages([msg.key])
      }
      for (const [, plugin] of globalThis.plugins.entries()) {
        if (typeof plugin.event === 'function') {
          const stop = await plugin.event(msg, { sock })
          if (stop) return
        }
      }
      if (!msg.command) return
      if (db.settings.self && !msg.isOwner) return
      for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
        const isCmd = plugin?.cmd?.includes(msg.command)
        const isHidden = plugin?.hidden?.includes(msg.command)
        if (!isCmd && !isHidden) continue
        if (!checkPermissions(plugin, msg, config)) return
        const queue = getOrCreateQueue(pluginPath)
        const task = () => executeCommand(pluginPath, plugin, msg, sock, config)
        if (db.settings.antrian) {
          queue.items.push({ task })
          const position = queue.items.length + (queue.running ? 1 : 0)
          const isOwnerPrivilege = plugin?.settings?.owner || msg.isOwner
          if (position > 1 && !isOwnerPrivilege) {
            msg.reply(`[ ! ] Anda berada di antrian *#${position}*,\nMohon menunggu...`)
          }
          queue.process()
        } else {
          await task()
        }
        break
      }
    } else if (data.id && data.participants && data.action) {
      const { id, participants, action } = data
      for (const participant of participants) {
        const mention = participant.phoneNumber
        let text = ''
        switch (action) {
          case 'add':
            text = `👋 Selamat datang @${mention.split('@')[0]} di grup!`
            break
          case 'remove':
            text = `😢 Selamat tinggal @${mention.split('@')[0]}`
            break
          case 'promote':
            text = `🎉 @${mention.split('@')[0]} sekarang menjadi *Admin*!`
            break
          case 'demote':
            text = `⚠️ @${mention.split('@')[0]} tidak lagi menjadi *Admin*.`
            break
        }
        if (text) {
          await sock.sendMessage(id, { text, mentions: [mention] })
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}