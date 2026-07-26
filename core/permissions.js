export function checkPermissions(plugin, msg) {
  if (!plugin?.settings) return true
  if (plugin.settings.owner && !msg.isOwner) {
    msg.reply(global.msg.owner)
    return false
  }
  if (plugin.settings.group && !msg.isGroup) {
    msg.reply(global.msg.group)
    return false
  }
  if (plugin.settings.private && msg.isGroup) {
    msg.reply(global.msg.private)
    return false
  }
  if (msg.isGroup) {
    if (plugin.settings.admin && !msg.isAdmin) {
      msg.reply(global.msg.admin)
      return false
    }
    if (plugin.settings.botAdmin && !msg.isBotAdmin) {
      msg.reply(global.msg.botAdmin)
      return false
    }
  }
  return true
}