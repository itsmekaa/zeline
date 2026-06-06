export const run = {
  cmd: ['ping'],
  hidden: ['p'],
  category: 'tools',
  settings: {
    owner: false,
    group: false,
    admin: false,
    botAdmin: false,
    premium: false
  },
  run: async (ctx, { sock }) => {
    const start = Date.now()
    const msg = await ctx.reply('Testing latency...')
    const end = Date.now()
    
    await sock.sendMessage(ctx.chat, {
      text: `Pong!\nSpeed: ${end - start}ms`,
      edit: msg.key
    })
  }
}
