import { generateWAMessageFromContent, generateWAMessage } from 'baileys'
import { fileTypeFromBuffer } from 'file-type'
import * as self from './baileys.js'

export const sendAlbum = async (sock, jid, medias = [], options = {}) => {
  if (!Array.isArray(medias) || medias.length < 2) {
    throw new Error('Album minimal berisi 2 media.')
  }

  const mediaObj = []

  for (const item of medias) {
    let buffer
    let caption = ''

    try {
      if (typeof item === 'string') {
        const res = await fetch(item)
        if (!res.ok) continue
        buffer = Buffer.from(await res.arrayBuffer())
      } else if (typeof item === 'object') {
        caption = item.caption || ''
        if (item.url) {
          const res = await fetch(item.url)
          if (!res.ok) continue
          buffer = Buffer.from(await res.arrayBuffer())
        } else if (item.image || item.video || item.buffer) {
          buffer = item.image || item.video || item.buffer
        }
      }

      if (!buffer) continue

      const type = await fileTypeFromBuffer(buffer)
      if (!type) continue

      if (type.mime.startsWith('image/')) {
        mediaObj.push({ image: buffer, caption })
      } else if (type.mime.startsWith('video/')) {
        mediaObj.push({ video: buffer, caption })
      }
    } catch (e) {
      console.log(e.message)
      continue
    }
  }

  if (mediaObj.length < 2) {
    throw new Error('Gagal memproses media, minimal butuh 2 media gambar/video yang valid.')
  }

  if (options.caption) {
    mediaObj[0].caption = options.caption
    delete options.caption
  }

  const delayTime = options.delay || 3000
  delete options.delay

  const album = generateWAMessageFromContent(
    jid,
    {
      albumMessage: {
        expectedImageCount: mediaObj.filter((m) => m.image).length,
        expectedVideoCount: mediaObj.filter((m) => m.video).length,
        ...options,
      },
    },
    {
      userJid: sock.user?.id,
      quoted: options.quoted,
      ...options,
    }
  )

  await sock.relayMessage(jid, album.message, { messageId: album.key.id })

  const delayMsg = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  for (const media of mediaObj) {
    const msg = await generateWAMessage(jid, media, {
      userJid: sock.user?.id,
      upload: sock.waUploadToServer,
      quoted: options.quoted,
      ...options,
    })

    msg.message.messageContextInfo = {
      messageAssociation: {
        associationType: 1,
        parentMessageKey: album.key,
      },
    }

    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    await delayMsg(delayTime)
  }

  return album
}

export const bindSocket = (sock) => {
  for (const [name, func] of Object.entries(self)) {
    if (name !== 'bindSocket' && typeof func === 'function') {
      sock[name] = func.bind(null, sock)
    }
  }
  return sock
}