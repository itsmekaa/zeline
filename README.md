# Zeline WhatsApp Bot

> Modern WhatsApp Bot built with Baileys (ESM), featuring a plugin system, hot reload, sticker support, media processing, and modular architecture.

### ⌗ REQUIREMENTS

- [x] NodeJS >= 18
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

Edit `config.js`:

```js
import "dotenv/config";

export default {
  pairing: {
    state: true,
    number: process.env.PAIRING_NUMBER,
    code: "ZELINBOT"
  },

  owner: process.env.OWNER_NUMBER.split(","),

  api: {
    key: {
      gemini: process.env.GEMINI_API_KEY
    }
  }
};
```

Create `.env` file:

```env
PAIRING_NUMBER=628xxxxxxxxxx
OWNER_NUMBER=628xxxxxxxxxx
GEMINI_API_KEY=your_api_key
```

## Running Bot

Start bot:

```bash
npm start
```

Start with PM2:

```bash
pm2 start index.js --name "zeline" && pm2 logs zeline
```

## Project Structure

```text
zeline/
├── database/
├── lib/
├── plugins/
├── session/
├── config.js
├── handler.js
├── index.js
├── package.json
└── README.md
```

## Plugin Example

```js
export const run = {
  cmd: ["ping"],
  category: "main",
  run: async (ctx, { sock }) => {
    await ctx.reply("pong!!!");
  }
};
```

> [!WARNING]
> This project is currently under active development.
>
> Features may change without notice.
