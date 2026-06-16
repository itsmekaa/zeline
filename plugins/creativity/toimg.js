export const run = {
  cmd: ['toimage'],
  hidden: ['toimg'],
  category: 'creativity',
  run: async (ctx, { prefix, command }) => {

    if (
      !ctx.quoted &&
      !ctx.message?.stickerMessage
    ) {
      return ctx.reply(Func.usage(prefix, command, '(reply sticker)'))
    }

    try {
      const msg = ctx.quoted ? ctx.quoted : ctx
      const mime = msg.type || ''

      if (!/sticker/.test(mime)) {
        return ctx.reply('❌ Hanya support sticker!')
      }

      const buffer = await msg.download()

      await ctx.reply({
        image: buffer
      })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
