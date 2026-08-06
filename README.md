# Zeline WhatsApp Bot

<p align="center">
  <strong>Modern WhatsApp bot built with Baileys (ESM), featuring a plugin system, hot reload, sticker support, media processing and a modular architecture.</strong>
</p>

<p align="center">
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node.js-20%2B-339933?logo=node.js&style=for-the-badge" alt="Node.js 20+" />
  </a>
  <a href="https://github.com/itsmekaa/zeline/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-2E8B57?style=for-the-badge" alt="License: MIT" />
  </a>
</p>

## Overview

Zeline is a flexible WhatsApp automation bot designed for quick deployment and easy extension. It combines a plugin-based command system with media handling, sticker creation and live hot reload support for a smoother development experience.

## Why Zeline?

- Modular command architecture for easy feature expansion
- Built-in support for stickers, media processing and automation
- Fast setup with Baileys and ESM support
- Lightweight project structure for customization

## Requirements

Install the following before running Zeline locally:

### Windows

- [Node.js & npm](https://nodejs.org/) (Download the installer)
- [Git](https://git-scm.com/download/win)
- Terminal app (built-in)

### macOS

- [Node.js & npm](https://nodejs.org/) (Download the installer or use Homebrew:
  `brew install node`)
- [Git](https://git-scm.com/download/mac) (or install via Homebrew:
  `brew install git`)
- Terminal app (built-in)

### Linux

- [Node.js & npm](https://nodejs.org/en/download) (Follow the official
  instructions)
- [Git](https://git-scm.com/install/linux) (Follow the official instructions for
  your distribution)
- Terminal app (built-in)

**Verify installation:**

```bash
node --version
npm --version
git --version
```

Once these are installed, you can proceed to clone the repository and follow the
installation steps below.

## Installation

Clone the repository:

```bash
git clone https://github.com/itsmekaa/zeline.git
cd zeline
```

Install dependencies:

```bash
npm install
```

## Configuration

Create or edit the environment file:

```env
BOT = '62xxx'
OWNER = '62xxx'
DATABASE_URL = 'mongodb_url' # leave empty if you want to use localdb.json
```

## Running the Bot

Start the bot:

```bash
npm start
```

Or run it with PM2:

```bash
pm2 start pm2.config.cjs && pm2 logs zeline
```

## Project Structure

The main code is organized into a few core folders:

| Path                         | Purpose                                                                     |
| ---------------------------- | --------------------------------------------------------------------------- |
| [core](core)                 | Core bot runtime, handlers, queue logic and executor flow                   |
| [lib](lib)                   | Shared helpers, configuration, schemas, serializers and utilities           |
| [plugins](plugins)           | Feature modules such as moderation, downloads, AI, tools and group commands |
| [media](media)               | Prompt and media-related assets used by the bot                             |
| [index.js](index.js)         | Main entry point for launching the bot                                      |
| [package.json](package.json) | Project metadata, scripts and dependencies                                  |

## Plugin Example

A simple plugin can look like this:

```js
export const run = {
  cmd: ['ping'],
  category: 'main',
  run: async (m, { sock }) => {
    await m.reply('pong!!!');
  },
};
```

## Notes

> [!WARNING]
> This project is currently under active development.
>
> Features may change without notice.
