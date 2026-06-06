export default {
  pairing: {
    state: true,
    number: 62xx,
    code: 'ZELINBOT',
    browser: ['Mac OS', 'Safari', '14.0.0'],
    auth: 'session'
  },
  owner: ['62xxx'],
  prefix: ['.', '?', '!', '/'],
  sticker: {
    packname: 'Created by',
    author: 'Zeline bot'
  },
  msg: {
    wait: '[ + ] Executing command...',
    owner: '[ ! ] Access denied. Owner only.',
    premium: '[ ! ] Premium access required.',
    group: '[ ! ] This feature is only available in groups.',
    admin: '[ ! ] Admin privileges required.',
    botAdmin: '[ ! ] Bot needs admin privileges.',
    private: '[ ! ] This feature is only available in private chat.',
    error: '[ x ] An unexpected error occurred.'
  },
  api: {
    baseUrl: {
      anabot: 'https://anabot.my.id'
    },
    key: {
      gemini: 'KEY'
    }
  },
  database: 'database',
  tz: 'Asia/Jakarta'
}