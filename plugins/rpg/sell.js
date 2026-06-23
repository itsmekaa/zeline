export const run = {
  cmd: ['sell'],
  category: 'rpg',
  run: async (m, { prefix, command }) => {
    const u = db.users[m.sender].rpg
    const [item, qty, price] = (m.text || '').split(' ')
    const market = db.rpg.market

    if (!item || !qty || !price) return m.reply(Func.usage(prefix, command, 'item qty price'))
    if ((u.inventory[item] || 0) < qty) return m.reply('Item kurang')

    u.inventory[item] -= +qty

    market.sell.push({
      id: Date.now(),
      owner: m.sender,
      item,
      qty: +qty,
      price: +price
    })

    m.reply(`📉 Sell order : ${qty} ${item} @ ${price}`)
  }
}
