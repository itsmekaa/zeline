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

    const ctx = await serialize(m, sock)

    await db.init(ctx)
    logger(ctx)

    if (global.db.settings.autoread) {
      await sock.readMessages([m.key])
    }

    if (ctx.isGroup) {
      const metadata = await sock.groupMetadata(ctx.chat).catch(() => null)
      if (metadata) {
        const admins = []
        for (const p of metadata.participants) {
          if (p.admin) {
            if (p.id) admins.push(jidNormalizedUser(p.id))
            if (p.phoneNumber) admins.push(jidNormalizedUser(p.phoneNumber))
          }
        }

        const senderIds = [
          ctx.sender,
          m.key.participant ? jidNormalizedUser(m.key.participant) : null,
          m.key.participantAlt ? jidNormalizedUser(m.key.participantAlt) : null
        ].filter(Boolean)

        ctx.isAdmin = senderIds.some(id => admins.includes(id)) || ctx.isOwner

        const botIdNormalized = sock.user?.id ? jidNormalizedUser(sock.user.id) : ''
        const botNumberJid = config.botnumber ? `${config.botnumber}@s.whatsapp.net` : ''
        const botIds = [
          botIdNormalized,
          botIdNormalized.split('@')[0] + '@s.whatsapp.net',
          botIdNormalized.split('@')[0] + '@lid',
          botNumberJid
        ].filter(Boolean)

        ctx.isBotAdmin = botIds.some(id => admins.includes(id))
      }
    }

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
      if (plugin && typeof plugin.event === 'function') {
        const isStop = await plugin.event(ctx, { sock })
        if (isStop) return
      }
    }

    if (!ctx.command) return

    if (global.db.settings.self && !ctx.isOwner) return

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
      const isCmd = plugin?.cmd && plugin.cmd.includes(ctx.command)
      const isHidden = plugin?.hidden && plugin.hidden.includes(ctx.command)

      if (isCmd || isHidden) {
        if (plugin?.settings) {
          if (plugin.settings.owner && !ctx.isOwner) return ctx.reply(config.msg.owner)
          if (plugin.settings.group && !ctx.isGroup) return ctx.reply(config.msg.group)
          if (plugin.settings.private && ctx.isGroup) return ctx.reply(config.msg.private)

          if (ctx.isGroup) {
            if (plugin.settings.admin && !ctx.isAdmin) return ctx.reply(config.msg.admin)
            if (plugin.settings.botAdmin && !ctx.isBotAdmin) return ctx.reply(config.msg.botAdmin)
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
            await plugin.run(ctx, { sock, prefix: ctx.prefix, command: ctx.command, text: ctx.args.join(' '), args: ctx.args })
          } catch (error) {
            ctx.reply(config.msg.error)
          }
        }

        if (global.db.settings.antrian) {
          queue.items.push({ task: executeCmd })
          
          const position = queue.items.length + (queue.running ? 1 : 0)
          const isOwnerPrivilege = plugin?.settings?.owner || ctx.isOwner

          if (position > 1 && !isOwnerPrivilege) {
            ctx.reply(`[ ! ] Anda berada di antrian *#${position}*,\nMohon menunggu...`)
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