export const run = {
  event: async () => {
    const m = (db.rpg ??= {}).market ??= { sell: [], buy: [], history: [] }

    if (!m.sell.length || !m.buy.length) return

    for (let i = 0; i < m.buy.length; i++) {
      for (let j = 0; j < m.sell.length; j++) {
        const b = m.buy[i]
        const s = m.sell[j]

        if (!b || !s) continue
        if (b.item !== s.item) continue
        if (b.price < s.price) continue

        const qty = Math.min(b.qty, s.qty)
        const total = qty * s.price

        const buyer = db.users[b.owner]?.rpg
        const seller = db.users[s.owner]?.rpg
        if (!buyer || !seller) continue

        buyer.inventory[s.item] = (buyer.inventory[s.item] || 0) + qty
        seller.gold += total

        b.qty -= qty
        s.qty -= qty

        m.history.push({
          item: s.item,
          qty,
          price: s.price,
          buyer: b.owner,
          seller: s.owner,
          time: Date.now()
        })

        if (b.qty <= 0) m.buy.splice(i--, 1)
        if (s.qty <= 0) m.sell.splice(j--, 1)
      }
    }
  }
}