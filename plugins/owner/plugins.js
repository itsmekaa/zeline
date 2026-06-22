import fs from 'fs-extra'
import path from 'path'

export const run = {
  cmd: ['plugins'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (m, { args }) => {
    const action = args[0]?.toLowerCase()
    const pluginPath = args[1]

    if (!action || !pluginPath) return m.reply(`Format: ${m.prefix}${m.command} <add/del/get> <path>`)
    
    const targetPath = path.join(process.cwd(), 'plugins', pluginPath)

    if (action === 'add') {
      if (!m.quoted || !m.quoted.text) return m.reply('Reply kode plugin.')
      if (!m.quoted.text.includes('export const run')) return m.reply('Format plugin tidak valid. Harus memiliki export const run.')
      
      await fs.ensureDir(path.dirname(targetPath))
      await fs.writeFile(targetPath, m.quoted.text)
      m.reply('plugin saved')
    } else if (action === 'del' || action === 'delete') {
      if (!fs.existsSync(targetPath)) return m.reply('File tidak ditemukan.')
      
      await fs.unlink(targetPath)
      m.reply('plugin deleted')
    } else if (action === 'get') {
      if (!fs.existsSync(targetPath)) return m.reply('File tidak ditemukan.')
      
      const content = await fs.readFile(targetPath, 'utf-8')
      if (content.length > 60000) {
        const buffer = Buffer.from(content)
        await m.reply(buffer, { fileName: path.basename(targetPath) })
      } else {
        m.reply(content)
      }
    } else {
      m.reply(`Action tidak valid. Gunakan add, del, atau get.`)
    }
  }
}
