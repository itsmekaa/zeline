export const run = {
  event: async (ctx, { sock }) => {
    if (!ctx.isGroup || !ctx.text || !db.groups[ctx.chat].antilink) return false

    const url = Func.validUrl(ctx.text, 'whatsapp.com')

    if (!url) return false

    if (ctx.isBotAdmin && !ctx.isAdmin) {
      await sock.sendMessage(ctx.chat, { delete: ctx.key })
      return true
    }

    return false
  }
}
