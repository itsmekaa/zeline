export const run = {
  cmd: ['self'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (ctx, { prefix, command, text }) => {
    const action = text?.toLowerCase()

    if (action === 'on' || action === 'true') {
      global.db.settings.self = true
      return ctx.reply('🔒 *Self Mode Berhasil Diaktifkan.*\nSekarang bot hanya akan merespons perintah dari Owner.')
    } else if (action === 'off' || action === 'false') {
      global.db.settings.self = false
      return ctx.reply('🔓 *Self Mode Berhasil Dimatikan.*\nSekarang semua pengguna bisa menggunakan bot kembali.')
    } else {
      return ctx.reply(`Status Mode Self saat ini: *${global.db.settings.self ? 'ON (Owner Only)' : 'OFF (Public)'}*\n\nUbah status dengan mengetik:\n*${prefix + command} on*\n*${prefix + command} off*`)
    }
  }
}