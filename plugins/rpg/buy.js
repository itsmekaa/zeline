export const run = {
  cmd: ['buy'],
  category: 'rpg',
  run: async (m, { prefix, command }) => {
    const u = db.users[m.sender].rpg
    const [item, qty, price] = (m.text || '').split(' ')
    const market = db.rpg.market

    if (!item || !qty || !price) return m.reply(Func.usage(prefix, command, 'item qty price'))

    const cost = qty * price
    if (u.gold < cost) return m.reply('Gold kurang')

    u.gold -= cost

    market.buy.push({
      id: Date.now(),
      owner: m.sender,
      item,
      qty: +qty,
      price: +price
    })

    m.reply(`📈 Buy order : ${qty} ${item} @ ${price}`)
  }
}
