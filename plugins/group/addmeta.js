export const run = {
  cmd: ['addmeta'],
  category: 'group',
  settings: {
    admin: true,
    group: true
  },
  run: async (ctx, { sock }) => {
    const result = await sock.groupParticipantsUpdate(
      ctx.chat,
      ["867051314767696@bot"],
      "add"
    )
    ctx.reply(JSON.stringify(result, null, 2))
  }
}
