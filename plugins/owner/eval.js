import util from 'util'

export const run = {
  cmd: ['eval'],
  hidden: ['ev'],
  category: 'owner',
  description: 'execute javascript code',
  settings: {
    owner: true
  },
  run: async (m, { sock, command, text }) => {
    if (!text) return m.reply('enter javascript code.')

    try {
      const evalCmd = (command === 'ev')
        ? (async () => { return eval(`(${text})`) })()
        : (async () => { return eval(`(async () => { ${text} })()`) })()

      let evaled = await eval(evalCmd)

      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled, { depth: null, compact: false })
      }

      await m.reply(String(evaled))
    } catch (e) {
      await m.reply(util.format(e))
    }
  }
}
