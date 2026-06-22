import chalk from 'chalk'
import moment from 'moment-timezone'

export const logger = (m) => {
  const time = moment().tz(config.tz).format('HH:mm:ss')
  const chatType = m.isGroup ? 'GROUP' : 'PRIVATE'
  const color = m.isGroup ? chalk.blue.bold : chalk.yellow.bold

  if (m.body) {
    console.log(
      chalk.gray.bold(`[${time}]`),
      color(chatType),
      chalk.cyan.bold(m.sender.split('@')[0]),
      chalk.magenta.bold(m.type),
      chalk.green.bold(m.command || 'MESSAGE'),
      chalk.white.bold(m.body)
    )
  }
}
