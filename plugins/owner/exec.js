import { exec } from 'child_process'
import util from 'util'

export const run = {
  cmd: ['exec'],
  hidden: ['ex'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (ctx, { text }) => {
    if (!text) return ctx.reply('Masukkan command terminal.')
    
    exec(text, (error, stdout, stderr) => {
      if (stdout) return ctx.reply(util.format(stdout).trim())
      if (stderr) return ctx.reply(util.format(stderr).trim())
      if (error) return ctx.reply(util.format(error.message).trim())
    })
  }
}