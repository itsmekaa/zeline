import chalk from 'chalk'
import moment from 'moment-timezone'

const ICONS = {
  GROUP: '◈',
  PRIVATE: '◇',
  DEFAULT: '○',
}

const TYPE_COLOR = {
  text: chalk.white,
  image: chalk.magenta,
  video: chalk.blue,
  audio: chalk.cyan,
  sticker: chalk.yellow,
  document: chalk.gray,
}

export const logger = (m) => {
  const time = moment().tz(config.tz).format('HH:mm:ss')
  const isGroup = m.isGroup
  const icon = isGroup ? ICONS.GROUP : ICONS.PRIVATE
  const chatLabel = isGroup
    ? chalk.hex('#4fc3f7').bold('group')
    : chalk.hex('#ce93d8').bold('private')

  const typeColor = TYPE_COLOR[m.type] || chalk.white
  const sender = m.sender.split('@')[0]
  const cmd = m.command
    ? chalk.hex('#69ff47').bold(`!${m.command}`)
    : chalk.dim('─')

  if (!m.body) return

  const dim = chalk.dim

  console.log(
    dim('│'),
    chalk.dim(time),
    dim('·'),
    chalk.bold(icon),
    chatLabel,
    dim('·'),
    chalk.hex('#ffcc02').bold(sender),
    dim('·'),
    typeColor(m.type),
    dim('→'),
    cmd,
    '\n',
    dim('╰─'),
    chalk.white(m.body)
  )
}
