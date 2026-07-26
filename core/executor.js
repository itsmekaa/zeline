export async function executeCommand(pluginPath, plugin, msg, sock, config) {
  try {
    await plugin.run(msg, {
      sock,
      prefix: msg.prefix,
      command: msg.command,
      text: msg.args.join(' '),
      args: msg.args
    })
  } catch (error) {
    console.error(error)
    msg.reply(config.msg.error)
  }
}