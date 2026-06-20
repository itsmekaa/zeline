export const run = {
  cmd: ['sell'],
  category: 'rpg',
  run: async (ctx, { prefix, command }) => {
    const u = db.users[ctx.sender].rpg
    const [item, qty, price] = (ctx.text || '').split(' ')
    const m = db.rpg.market

    if (!item || !qty || !price) return ctx.reply(Func.usage(prefix, command, 'item qty price'))
    if ((u.inventory[item] || 0) < qty) return ctx.reply('Item kurang')

    u.inventory[item] -= +qty

    m.sell.push({
      id: Date.now(),
      owner: ctx.sender,
      item,
      qty: +qty,
      price: +price
    })

    ctx.reply(`📉 Sell order : ${qty} ${item} @ ${price}`)
  }
}