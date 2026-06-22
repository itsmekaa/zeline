export const run = {
  cmd: ['mode'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (m, { prefix, command, args }) => {
    const validModes = Object.keys(global.db.settings)

    if (args.length < 1) {
      let modeList = 'Current settings:\n'
      for (const mode of validModes) {
        modeList += `- ${mode}: ${global.db.settings[mode] ? 'on' : 'off'}\n`
      }

      return m.reply(`${modeList}\nSwitch mode:\n${prefix + command} self on`)
    }

    const modeType = args[0]?.toLowerCase()
    const action = args[1]?.toLowerCase()
    const formattedMode = modeType.charAt(0).toUpperCase() + modeType.slice(1)

    if (!validModes.includes(modeType)) {
      return m.reply(`Mode *${modeType}* not found. Available modes: *${validModes.join(', ')}*`)
    }

    if (action === 'on') {
      global.db.settings[modeType] = true
      return m.reply(`${formattedMode} Mode switched to : *[ ON ]*`)
    } else if (action === 'off') {
      global.db.settings[modeType] = false
      return m.reply(`${formattedMode} Mode switched to : *[ OFF ]*`)
    } else {
      return m.reply(`Current status of *${modeType}* mode: *${global.db.settings[modeType] ? 'on' : 'off'}*\n\nChange the status by typing:\n*${prefix + command} ${modeType} on*\n*${prefix + command} ${modeType} off*`)
    }
  }
}
