export const run = {
  cmd: ['setwelcome', 'setleave'],
  category: 'group',
  settings: {
    group: true,
    admin: true,
    botAdmin: false
  },
  usage: 'text',
  run: async (m, { prefix, command, args }) => {
    const group = global.db.groups[m.chat]

    const modeType = command === 'setwelcome' ? 'welcome' : 'leave'

    const placeholder = `available placeholder:
@user -> mention user
@group -> group name
@time -> current time in ${tz}`

    if (!group[modeType] || typeof group[modeType] !== 'object') {
      group[modeType] = { text: '' }
    }

    const text = args.join(' ')

    if (!text) {
      return m.reply(
        `current text: ${group[modeType].text || '(not set)'}\n\nexample:\n${prefix + command} 👋 welcome @user to @group at @time\n\n${placeholder}`
      )
    }

    group[modeType].text = text

    return m.reply(
      `${modeType} text updated.\n\n${placeholder}`
    )
  }
}