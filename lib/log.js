import chalk from 'chalk'
import moment from 'moment-timezone'

export const logger = (ctx) => {
  const time = moment().tz(config.tz).format('HH:mm:ss')
  const chatType = ctx.isGroup ? 'GROUP' : 'PRIVATE'
  const color = ctx.isGroup ? chalk.blue.bold : chalk.yellow.bold

  if (ctx.body) {
    console.log(
      chalk.gray.bold(`[${time}]`),
      color(chatType),
      chalk.cyan.bold(ctx.sender.split('@')[0]),
      chalk.magenta.bold(ctx.type),
      chalk.green.bold(ctx.command || 'MESSAGE'),
      chalk.white.bold(ctx.body)
    )
  }
}
