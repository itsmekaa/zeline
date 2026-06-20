import fs from 'fs';

const monsters = JSON.parse(fs.readFileSync('./src/rpg/monsters.json', 'utf-8'));

export const run = {
  cmd: ['adventure'],
  category: 'rpg',
  run: async (ctx) => {
    const u = db.users[ctx.sender].rpg;

    if (u.hp < 20) return ctx.reply(`HP terlalu rendah : *[ ${u.hp} ]*`);

    const m = monsters[Math.random() * monsters.length | 0];

    const exp = (Math.random() * (m.maxExp - m.minExp + 1) | 0) + m.minExp;
    const gold = (Math.random() * (m.maxGold - m.minGold + 1) | 0) + m.minGold;
    const dmg = (Math.random() * m.damage | 0) + 3;

    u.exp += exp;
    u.gold += gold;
    u.hp = Math.max(0, u.hp - dmg);

    let msg = '';
    const need = u.level * 100;

    if (u.exp >= need) {
      u.level++;
      u.exp -= need;
      msg = `\n🎉 *LEVEL UP!* Kamu sekarang level ${u.level}!`;
    }

    return ctx.reply(
`*⚔️ PETUALANGAN RPG ⚔️*
Kamu bertemu dengan *${m.nama}*!

🟢 *Mendapat:* +${exp} EXP & +${gold} Gold
🔴 *Terluka:* -${dmg} HP
❤️ *Sisa HP:* ${u.hp}/100${msg}`
    );
  }
};