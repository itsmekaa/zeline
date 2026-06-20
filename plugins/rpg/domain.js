import fs from 'fs'

const domains = JSON.parse(
  fs.readFileSync('./src/rpg/domain.json', 'utf-8')
)

export const run = {
  cmd: ['domain'],
  category: 'rpg',
  run: async (ctx) => {
    const u = db.users[ctx.sender].rpg
    const now = Date.now()

    const remaining = u.cooldown.domain - now
    if (remaining > 0) {
      const second = Math.ceil(remaining / 1000)
      return ctx.reply(`Cooldown : *[ ${Func.toDate(second)} ]*`)
    }

    const d = domains[(Math.random() * domains.length) | 0]
    const dmg = (u.attack + Math.random() * 15) | 0
    const rewardGold = (Math.random() * (d.max - d.min) | 0) + d.min
    const item = d.reward[(Math.random() * d.reward.length) | 0]

    u.gold += rewardGold
    u.exp += 40
    u.inventory[item] = (u.inventory[item] || 0) + 1
    u.cooldown.domain = now + 120000

    return ctx.reply(
`🗺️ DOMAIN CLEAR
${d.name} (${d.element})

⚔️ Damage : ${dmg}

🎁 Reward :
+${rewardGold} Gold
+1 ${item}
+40 EXP`
    )
  }
}