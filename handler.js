import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'
import chalk from 'chalk'
import { jidNormalizedUser } from 'baileys'

export const handler = async (sock, m) => {
  try {
    if (!m.message) return

    const ctx = await serialize(m, sock)
    //await sock.readMessages([m.key])

    await db.init(ctx)
    logger(ctx)

    if (!ctx.command) return

    if (global.db.settings.self && !ctx.isOwner) return

    for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
      const isCmd = plugin.cmd && plugin.cmd.includes(ctx.command)
      const isHidden = plugin.hidden && plugin.hidden.includes(ctx.command)

      if (isCmd || isHidden) {
        if (plugin.settings) {
          if (plugin.settings.owner && !ctx.isOwner) {
            return ctx.reply(config.msg.owner)
          }
          if (plugin.settings.group && !ctx.isGroup) {
            return ctx.reply(config.msg.group)
          }
          if (plugin.settings.private && ctx.isGroup) {
            return ctx.reply(config.msg.private)
          }

          if (ctx.isGroup) {
            const metadata = await sock.groupMetadata(ctx.chat)
            
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

            ctx.isAdmin = senderIds.some(id => admins.includes(id))

            const botIdNormalized = sock.user?.id ? jidNormalizedUser(sock.user.id) : ''
            const botNumberJid = config.botnumber ? `${config.botnumber}@s.whatsapp.net` : ''

            const botIds = [
              botIdNormalized,
              botIdNormalized.split('@')[0] + '@s.whatsapp.net',
              botIdNormalized.split('@')[0] + '@lid',
              botNumberJid
            ].filter(Boolean)

            ctx.isBotAdmin = botIds.some(id => admins.includes(id))

            if (plugin.settings.admin && !ctx.isAdmin && !ctx.isOwner) {
              return ctx.reply(config.msg.admin)
            }
            if (plugin.settings.botAdmin && !ctx.isBotAdmin) {
              return ctx.reply(config.msg.botAdmin)
            }
          }
        }

        try {
          await plugin.run(ctx, { sock, prefix: ctx.prefix, command: ctx.command, text: ctx.args.join(' '), args: ctx.args })
        } catch (error) {
          ctx.reply(config.msg.error)
        }
        break
      }
    }
  } catch (error) {
  }
}