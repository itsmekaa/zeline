export const run = {
  cmd: ['antilink', 'welcome', 'leave'],
  category: 'group',
  settings: {
    group: true,
    admin: true,
    botAdmin: false
  },
  usage: 'on / off',
  run: async (m, { prefix, command, args }) => {
    const group = global.db.groups[m.chat]

    const modeType = command

    const action = args[0]?.toLowerCase()

    if (!action) {
      return m.reply(
        `current status of *${modeType}* mode: *${group[modeType] ? 'on' : 'off'}*\n\nchange the status by typing:\n*${prefix + command} on*\n*${prefix + command} off*`
      )
    }

    if (action === 'on') {
      group[modeType] = true
      return m.reply(`${modeType} mode switched to : *[ on ]*`)
    }

    if (action === 'off') {
      group[modeType] = false
      return m.reply(`${modeType} mode switched to : *[ off ]*`)
    }

    return m.reply(
      `invalid action. usage:\n*${prefix + command} on*\n*${prefix + command} off*`
    )
  }
}