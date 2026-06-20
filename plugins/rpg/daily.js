import fs from 'fs';

const rewards = JSON.parse(fs.readFileSync('./src/rpg/rewards.json', 'utf-8'));

export const run = {
  cmd: ['daily'],
  category: 'rpg',
  run: async (ctx) => {
    const u = db.users[ctx.sender].rpg;
    const now = Date.now();

    if (u.lastDaily && now - u.lastDaily < 86400000) {
      return ctx.reply(`Cooldown : *[ ${Func.toDate(Math.floor((86400000 - (now - u.lastDaily)) / 1000))} ]*`);
    }

    const r = rewards.daily;
    u.gold += r.gold;

    let item = '';
    for (const i in r.items) {
      u.inventory[i] = (u.inventory[i] || 0) + r.items[i];
      item += `\n📦 ${r.items[i]} ${i}`;
    }

    u.lastDaily = now;

    return ctx.reply(`*🎁 DAILY REWARD 🎁*\n💰 *${r.gold} Gold*${item}`);
  }
};