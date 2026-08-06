import { jidDecode } from 'baileys'

export const run = {
  cmd: ['wame'],
  category: 'group',
  usage: 'create whatsapp link',
  settings: {
    group: true
  },
  run: async (m, {
    text
  }) => {
    const target = m.quoted ? m.quoted.sender : m.sender;
    const number = jidDecode(target)?.user || target;
    const chat = text || 'hai';
    m.reply(`https://wa.me/${number}?text=${encodeURIComponent(chat)}`);
  }
}
