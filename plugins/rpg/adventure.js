import fs from 'fs';

const monsters = JSON.parse(fs.readFileSync('./src/rpg/monsters.json', 'utf-8'));

export const run = {
  cmd: ['adventure'],
  category: 'rpg',
  run: async (m) => {
    const u = db.users[m.sender].rpg;

    if (u.hp < 20) return m.reply(`HP terlalu rendah : *[ ${u.hp} ]*`);

    const monster = monsters[Math.random() * monsters.length | 0];

    const exp = (Math.random() * (monster.maxExp - monster.minExp + 1) | 0) + monster.minExp;
    const gold = (Math.random() * (monster.maxGold - monster.minGold + 1) | 0) + monster.minGold;
    const dmg = (Math.random() * monster.damage | 0) + 3;

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

    return m.reply(
`*⚔️ PETUALANGAN RPG ⚔️*
Kamu bertemu dengan *${monster.nama}*!

🟢 Mendapat : +${exp} EXP & +${gold} Gold
🔴 Terluka : -${dmg} HP
❤️ Sisa HP : ${u.hp}/100${msg}`
    );
  }
};
