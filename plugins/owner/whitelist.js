export const run = {
  cmd: ['whitelist'],
  hidden: ['wl'],
  category: 'owner',
  usage: 'manage whitelist access',
  settings: {
    owner: true,
    group: true
  },
  run: async (m, { prefix, command, args }) => {
    const action = args[0]?.toLowerCase()
    const targetChat = args[1] || m.chat

    if (action === 'add') {
      if (global.db.settings.whitelist.id.includes(targetChat)) {
        return m.reply('this chat is already whitelisted.')
      }

      global.db.settings.whitelist.id.push(targetChat)
      return m.reply('chat added to whitelist.')
    }

    if (action === 'del') {
      if (!global.db.settings.whitelist.id.includes(targetChat)) {
        return m.reply('this chat is not whitelisted.')
      }

      global.db.settings.whitelist.id = global.db.settings.whitelist.id.filter(id => id !== targetChat)
      return m.reply('chat removed from whitelist.')
    }

    if (action === 'list') {
      const list = global.db.settings.whitelist.id
      if (!list.length) return m.reply('whitelist is empty.')
      return m.reply(list.map((id, i) => `${i + 1}. ${id}`).join('\n'))
    }

    return m.reply(`usage:\n${prefix}${command} add [chatId]\n${prefix}${command} del [chatId]\n${prefix}${command} list`)
  }
}