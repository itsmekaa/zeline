export const run = {
  cmd: ['groupset'],
  hidden: ['gcset', 'groupsettings'],
  category: 'group',
  settings: {
    group: true,
    admin: true,
    botAdmin: true
  },
  run: async (ctx, { prefix, command, args }) => {
    const validModes = Object.keys(global.db.groups[ctx.chat])
      .filter(key => typeof global.db.groups[ctx.chat][key] === 'boolean')

    if (args.length < 1) {
      let modeList = 'Current settings:\n'
      for (const mode of validModes) {
        modeList += `- ${mode}: ${global.db.groups[ctx.chat][mode] ? 'on' : 'off'}\n`
      }

      return ctx.reply(`${modeList}\nSwitch mode:\n${prefix + command} antilink on`)
    }

    const modeType = args[0]?.toLowerCase()
    const action = args[1]?.toLowerCase()
    const formattedMode = modeType.charAt(0).toUpperCase() + modeType.slice(1)

    if (!validModes.includes(modeType)) {
      return ctx.reply(`Mode *${modeType}* not found. Available modes: *${validModes.join(', ')}*`)
    }

    if (action === 'on') {
      global.db.groups[ctx.chat][modeType] = true
      return ctx.reply(`${formattedMode} Mode switched to : *[ ON ]*`)
    } else if (action === 'off') {
      global.db.groups[ctx.chat][modeType] = false
      return ctx.reply(`${formattedMode} Mode switched to : *[ OFF ]*`)
    } else {
      return ctx.reply(`Current status of *${modeType}* mode: *${global.db.groups[ctx.chat][modeType] ? 'on' : 'off'}*\n\nChange the status by typing:\n*${prefix + command} ${modeType} on*\n*${prefix + command} ${modeType} off*`)
    }
  }
}
