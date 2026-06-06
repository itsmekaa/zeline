import fs from 'fs-extra'
import path from 'path'

export const run = {
  cmd: ['plugins'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (ctx, { args }) => {
    const action = args[0]?.toLowerCase()
    const pluginPath = args[1]

    if (!action || !pluginPath) return ctx.reply(`Format: ${ctx.prefix}${ctx.command} <add/del/get> <path>`)
    
    const targetPath = path.join(process.cwd(), 'plugins', pluginPath)

    if (action === 'add') {
      if (!ctx.quoted || !ctx.quoted.text) return ctx.reply('Reply kode plugin.')
      if (!ctx.quoted.text.includes('export const run')) return ctx.reply('Format plugin tidak valid. Harus memiliki export const run.')
      
      await fs.ensureDir(path.dirname(targetPath))
      await fs.writeFile(targetPath, ctx.quoted.text)
      ctx.reply('plugin saved')
    } else if (action === 'del' || action === 'delete') {
      if (!fs.existsSync(targetPath)) return ctx.reply('File tidak ditemukan.')
      
      await fs.unlink(targetPath)
      ctx.reply('plugin deleted')
    } else if (action === 'get') {
      if (!fs.existsSync(targetPath)) return ctx.reply('File tidak ditemukan.')
      
      const content = await fs.readFile(targetPath, 'utf-8')
      if (content.length > 60000) {
        const buffer = Buffer.from(content)
        await ctx.reply(buffer, { fileName: path.basename(targetPath) })
      } else {
        ctx.reply(content)
      }
    } else {
      ctx.reply(`Action tidak valid. Gunakan add, del, atau get.`)
    }
  }
}
