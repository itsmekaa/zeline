import fs from 'fs/promises'
import path from 'path'

export const run = {
  cmd: ['ai'],
  category: 'ai',
  usage: 'text',
  run: async (m, { text }) => {
    if (!text) return m.reply(Func.usage(m.prefix, m.command, 'halo'))

    try {
      const media = m.quoted?.message?.imageMessage ? m.quoted : m.message?.imageMessage ? m : null

      const imageUrl = media ? await uploader.uguu(await media.download()) : null

      const data = await Api('/ai', {
        text,
        search: 'true',
        prompt: await fs.readFile(path.join(process.cwd(), 'media', 'prompt.txt'), 'utf-8'),
        ...(imageUrl && { imageUrl })
      })

      await m.reply(data.results.text.trim())
    } catch (e) {
      console.error(e)
      m.reply(msg.error)
    }
  }
}