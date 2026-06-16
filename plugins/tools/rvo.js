export const run = {
  cmd: ['rvo'],
  hidden: ['vv'],
  category: 'tools',
  run: async (ctx, { prefix, command }) => {
    const q = ctx.quoted

    if (!q?.message) {
      return ctx.reply(Func.usage(prefix, command, '(reply view once)'))
    }

    const inner = q.message
    const msg =
      inner.videoMessage ||
      inner.imageMessage ||
      inner.audioMessage

    if (!msg || msg.viewOnce !== true) {
      return ctx.reply('Mimetype not supported!')
    }

    try {
      const buffer = await q.download()

      if (inner.videoMessage) {
        await ctx.reply({ video: buffer })
      } else if (inner.imageMessage) {
        await ctx.reply({ image: buffer })
      } else if (inner.audioMessage) {
        await ctx.reply({ audio: buffer })
      }
    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
