import 'dotenv/config'

global.pairing = {
  state: true,
  number: process.env.BOT,
  code: 'ZELINBOT',
  auth: 'session'
}

global.owner = process.env.OWNER ? process.env.OWNER.split(',') : []

global.prefix = ['.', '?', '!', '/']

global.sticker = {
  packname: 'zeline',
  author: 'wabot'
}

global.emoji = '🍃'

global.style = {
  footer: 'ʟɪɢʜᴛᴡᴇɪɢʜᴛ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ᴋᴀᴀ ッ'
}

global.msg = {
  wait: '[ + ] Executing command...',
  owner: '[ ! ] Access denied. Owner only.',
  premium: '[ ! ] Premium access required.',
  group: '[ ! ] This feature is only available in groups.',
  admin: '[ ! ] Admin privileges required.',
  botAdmin: '[ ! ] Bot needs admin privileges.',
  private: '[ ! ] This feature is only available in private chat.',
  error: '[ x ] An unexpected error occurred.'
}

global.tz = 'Asia/Jakarta'