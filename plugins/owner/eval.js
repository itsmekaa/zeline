import util from 'util'

export const run = {
  cmd: ['eval'],
  hidden: ['ev'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (ctx, { sock, command, text }) => {
    if (!text) return ctx.reply('Masukkan kode JavaScript.')
    try {
      const evalCmd = (command === 'ev') 
        ? `(async () => { return ${text} })()` 
        : `(async () => { ${text} })()`
        
      let evaled = await eval(evalCmd)
      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled, { depth: null, compact: false })
      }
      await ctx.reply(String(evaled))
    } catch (e) {
      await ctx.reply(util.format(e))
    }
  }
}