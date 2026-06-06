import { getContentType, jidNormalizedUser, downloadMediaMessage } from 'baileys'
import { fileTypeFromBuffer } from 'file-type'

export const serialize = async (m, sock) => {
  if (!m) return m
  const ctx = {}
  
  ctx.key = m.key
  ctx.message = m.message

  ctx.id = m.key.id
  ctx.chat = m.key.remoteJid
  ctx.isGroup = ctx.chat.endsWith('@g.us')
  ctx.sender = jidNormalizedUser(ctx.isGroup ? (m.key.participant || m.key.remoteJid) : m.key.remoteJidAlt)
  ctx.pushName = m.pushName || 'User'
  
  if (m.message) {
    let msg = m.message
    
    if (msg.viewOnceMessageV2) {
      msg = msg.viewOnceMessageV2.message
    } else if (msg.ephemeralMessage) {
      msg = msg.ephemeralMessage.message
    } else if (msg.viewOnceMessageV2Extension) {
      msg = msg.viewOnceMessageV2Extension.message
    }
    
    ctx.type = getContentType(msg)
    
    ctx.body = ctx.type === 'conversation' ? msg.conversation 
      : ctx.type === 'extendedTextMessage' ? msg.extendedTextMessage.text 
      : ctx.type === 'imageMessage' ? msg.imageMessage.caption 
      : ctx.type === 'videoMessage' ? msg.videoMessage.caption 
      : ''
      
    if (typeof ctx.body !== 'string') ctx.body = ''
    ctx.body = ctx.body.trim()
    
    ctx.quoted = null
    const contextInfo = msg[ctx.type]?.contextInfo || {}
    ctx.mentions = contextInfo.mentionedJid || []

    let quotedMentions = []
    let quotedMsg = null
    let quotedType = null
    let quotedSender = contextInfo.participant ? jidNormalizedUser(contextInfo.participant) : null

    if (contextInfo.quotedMessage) {
      quotedMsg = contextInfo.quotedMessage
      quotedType = getContentType(quotedMsg)
      quotedMentions = quotedMsg[quotedType]?.contextInfo?.mentionedJid || []
    }
    
    const allJids = [ctx.sender, quotedSender, ...ctx.mentions, ...quotedMentions].filter(Boolean)
    const hasLid = allJids.some(jid => jid.endsWith('@lid'))

    if (ctx.isGroup && hasLid) {
      try {
        const participants = (await sock.groupMetadata(ctx.chat)).participants
        
        const mapLidStr = (jid) => {
          if (jid && jid.endsWith('@lid')) {
            const member = participants.find(p => p.id === jid)
            return member && member.phoneNumber ? member.phoneNumber : jid
          }
          return jid
        }

        ctx.sender = mapLidStr(ctx.sender)
        if (m.key.participant) m.key.participant = ctx.sender

        if (quotedSender) {
          quotedSender = mapLidStr(quotedSender)
          contextInfo.participant = quotedSender
        }

        const replaceTextLid = (text, lidNum, phoneNum) => {
          if (typeof text === 'string') {
            return text.replace(new RegExp('@' + lidNum, 'g'), '@' + phoneNum)
          }
          return text
        }

        const mapLid = (jid, targetMsg, targetType) => {
          if (jid.endsWith('@lid')) {
            const member = participants.find(p => p.id === jid)
            if (member && member.phoneNumber) {
              const lidNum = jid.split('@')[0]
              const phoneNum = member.phoneNumber.split('@')[0]

              if (targetMsg === msg) {
                ctx.body = replaceTextLid(ctx.body, lidNum, phoneNum)
              }

              if (targetMsg && targetMsg[targetType]) {
                if (targetMsg[targetType].text) {
                  targetMsg[targetType].text = replaceTextLid(targetMsg[targetType].text, lidNum, phoneNum)
                }
                if (targetMsg[targetType].caption) {
                  targetMsg[targetType].caption = replaceTextLid(targetMsg[targetType].caption, lidNum, phoneNum)
                }
                if (targetMsg[targetType].conversation) {
                  targetMsg[targetType].conversation = replaceTextLid(targetMsg[targetType].conversation, lidNum, phoneNum)
                }
              }
              
              return member.phoneNumber
            }
          }
          return jid
        }

        ctx.mentions = ctx.mentions.map(jid => mapLid(jid, msg, ctx.type))
        quotedMentions = quotedMentions.map(jid => mapLid(jid, quotedMsg, quotedType))

        if (msg[ctx.type]?.contextInfo?.mentionedJid) {
          msg[ctx.type].contextInfo.mentionedJid = ctx.mentions
        }
        if (quotedMsg && quotedMsg[quotedType]?.contextInfo?.mentionedJid) {
          quotedMsg[quotedType].contextInfo.mentionedJid = quotedMentions
        }

      } catch (err) {
        console.log(err.message)
      }
    }
    
    ctx.prefix = config.prefix.find(p => ctx.body.startsWith(p)) || ''
    ctx.command = ctx.prefix ? ctx.body.slice(ctx.prefix.length).trim().split(' ')[0].toLowerCase() : ''
    ctx.args = ctx.prefix ? ctx.body.slice(ctx.prefix.length).trim().split(/ +/).slice(1) : ctx.body.trim().split(/ +/)
    if (ctx.args.length === 1 && ctx.args[0] === '') ctx.args = []
    ctx.text = ctx.args.join(" ").trim();
    ctx.isOwner = config.owner.includes(ctx.sender.split("@")[0]) || m.key.fromMe

    if (quotedMsg) {
      ctx.quoted = {
        key: {
          remoteJid: ctx.chat,
          fromMe: contextInfo.participant === jidNormalizedUser(sock.user.id),
          id: contextInfo.stanzaId,
          participant: contextInfo.participant
        },
        message: quotedMsg,
        type: quotedType,
        sender: contextInfo.participant,
        text: quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || quotedMsg?.[quotedType]?.caption || '',
        mentions: quotedMentions
      }

      ctx.quoted.download = async () => {
        return await downloadMediaMessage(
          { key: ctx.quoted.key, message: ctx.quoted.message },
          'buffer',
          {},
          { logger: console }
        )
      }
    }
  }
  
  ctx.download = async () => {
    return await downloadMediaMessage(
      { key: ctx.key, message: ctx.message },
      'buffer',
      {},
      { logger: console }
    )
  }

  ctx.reply = async (content, options = {}) => {
    if (typeof content === 'string') {
      return sock.sendMessage(ctx.chat, { text: content, mentions: ctx.mentions, ...options }, { quoted: m })
    }
    if (Buffer.isBuffer(content)) {
      const type = await fileTypeFromBuffer(content)
      if (!type) {
        return sock.sendMessage(ctx.chat, { document: content, mimetype: 'application/octet-stream', ...options }, { quoted: m })
      }
      if (type.mime.startsWith('image/')) {
        return sock.sendMessage(ctx.chat, { image: content, mimetype: type.mime, ...options }, { quoted: m })
      }
      if (type.mime.startsWith('video/')) {
        return sock.sendMessage(ctx.chat, { video: content, mimetype: type.mime, ...options }, { quoted: m })
      }
      if (type.mime.startsWith('audio/')) {
        return sock.sendMessage(ctx.chat, { audio: content, mimetype: type.mime, ...options }, { quoted: m })
      }
      return sock.sendMessage(ctx.chat, { document: content, mimetype: type.mime, ...options }, { quoted: m })
    }
    if (typeof content === 'object') {
      return sock.sendMessage(ctx.chat, { ...content, ...options }, { quoted: m })
    }
  }

  return ctx
}
