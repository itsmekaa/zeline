export const run = {
  cmd: ['buy'],
  category: 'rpg',
  run: async (ctx, { prefix, command }) => {
    const u = db.users[ctx.sender].rpg
    const [item, qty, price] = (ctx.text || '').split(' ')
    const m = db.rpg.market

    if (!item || !qty || !price) return ctx.reply(Func.usage(prefix, command, 'item qty price'))

    const cost = qty * price
    if (u.gold < cost) return ctx.reply('Gold kurang')

    u.gold -= cost

    m.buy.push({
      id: Date.now(),
      owner: ctx.sender,
      item,
      qty: +qty,
      price: +price
    })

    ctx.reply(`📈 Buy order : ${qty} ${item} @ ${price}`)
  }
}