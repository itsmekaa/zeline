export const run = {
  cmd: ['market'],
  category: 'rpg',
  run: async (m) => {
    const m = db.rpg.market

    const sell = m.sell.slice(0, 5).map(x =>
`📉 ${x.item} x${x.qty} @ ${x.price}`
    ).join('\n') || '-'

    const buy = m.buy.slice(0, 5).map(x =>
`📈 ${x.item} x${x.qty} @ ${x.price}`
    ).join('\n') || '-'

    m.reply(
`🏪 MARKET

📉 SELL
${sell}

📈 BUY
${buy}

📊 Trades : ${m.history.length}`
    )
  }
}