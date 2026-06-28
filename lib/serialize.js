import { getContentType, jidNormalizedUser, downloadMediaMessage } from 'baileys'
import { fileTypeFromBuffer } from 'file-type'

export const serialize = async (raw, sock) => {
  if (!raw) return raw

  const m = {}

  m.key = raw.key
  m.message = raw.message

  m.id = raw.key.id
  m.chat = raw.key.remoteJid
  m.isGroup = m.chat.endsWith('@g.us')
  m.sender = jidNormalizedUser(
    m.isGroup
      ? raw.key.participant || raw.participant || m.chat
      : raw.key.remoteJid
  )

  m.pushName = raw.pushName || 'User'
  m.body = ''
  m.type = ''

  if (raw.message) {
    const msg = raw.message
    const type = getContentType(msg)
    m.type = type

    const content =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      ''

    m.body = (content || '').trim()
  }

  m.prefix = config.prefix.find(p => m.body.startsWith(p)) || ''
  m.command = m.prefix
    ? m.body.slice(m.prefix.length).trim().split(' ')[0].toLowerCase()
    : ''

  m.args = m.prefix
    ? m.body.slice(m.prefix.length).trim().split(/ +/).slice(1)
    : m.body.trim().split(/ +/)

  if (m.args.length === 1 && m.args[0] === '') m.args = []

  m.text = m.args.join(' ').trim()

  m.isOwner =
    config.owner.includes(m.sender.split('@')[0]) || raw.key.fromMe

  const ctx = raw.message?.[m.type]?.contextInfo

  m.quoted = ctx?.quotedMessage
    ? {
        key: {
          remoteJid: m.chat,
          id: ctx.stanzaId,
          participant: ctx.participant
        },
        message: ctx.quotedMessage,
        sender: ctx.participant,
        type: getContentType(ctx.quotedMessage)
      }
    : null

  m.download = async () => {
    return await downloadMediaMessage(
      { key: m.key, message: m.message },
      'buffer',
      {},
      { logger: console }
    )
  }

  m.reply = async (text, options = {}) => {
    return sock.sendMessage(
      m.chat,
      typeof text === 'string'
        ? { text }
        : { ...text },
      { quoted: raw, ...options }
    )
  }

  return m
}
