export const run = {
  cmd: ['market'],
  category: 'rpg',
  run: async (m) => {
    const market = db.rpg.market

    const sell = market.sell.slice(0, 5).map(x =>
`📉 ${x.item} x${x.qty} @ ${x.price}`
    ).join('\n') || '-'

    const buy = market.buy.slice(0, 5).map(x =>
`📈 ${x.item} x${x.qty} @ ${x.price}`
    ).join('\n') || '-'

    m.reply(
`🏪 MARKET

📉 SELL
${sell}

📈 BUY
${buy}

📊 Trades : ${market.history.length}`
    )
  }
}
