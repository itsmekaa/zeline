# Zeline WhatsApp Bot

> Modern WhatsApp Bot built with Baileys (ESM), featuring a plugin system, hot reload, sticker support, media processing, and modular architecture.

## Requirements

- [x] NodeJS >= 20
- [x] FFMPEG
- [x] Server vCPU/RAM 1/1GB (Min)

## Installation

Clone repository:

```bash
git clone https://github.com/itsmekaa/zeline.git
cd zeline
```

Install dependencies:

```bash
npm install
```

## Configuration
Edit `.env` file:

```env
BOT = '62xxx'
OWNER = '62xxx'
DATABASE_URL = 'mongodb_url' # leave empty if use localdb.json
```

## Running Bot

Start bot:

```bash
npm start
```

Start with PM2:

```bash
pm2 start pm2.config.cjs && pm2 logs zeline
```

## Project Structure

```text
zeline/
├── core/
├── lib/
├── plugins/
├── session/
├── index.js
├── localdb.json
├── package.json
└── README.md
```

## Plugin Example

```js
export const run = {
  cmd: ["ping"],
  category: "main",
  run: async (m, { sock }) => {
    await m.reply("pong!!!");
  }
};
```

> [!WARNING]
> This project is currently under active development.
>
> Features may change without notice.
