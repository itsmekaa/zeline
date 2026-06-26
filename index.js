import * as Func from './lib/function.js'
globalThis.Func = Func
global.Func = Func

import configData from './config.js'
globalThis.config = configData
global.config = configData

import { db } from './lib/schema.js'
globalThis.db = db
global.db = db

import * as uploader from './lib/uploader.js'
globalThis.uploader = uploader
global.uploader = uploader

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from 'baileys'
import pino from 'pino'
import chalk from 'chalk'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import qrcode from 'qrcode-terminal'
import { handler } from './handler.js'
import { bindSocket } from './lib/baileys.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plugins = new Map()
globalThis.plugins = plugins

const loadPlugins = async (dir) => {
    const files = await fs.readdir(dir)
    for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = await fs.stat(fullPath)
        if (stat.isDirectory()) {
            await loadPlugins(fullPath)
        } else if (file.endsWith('.js')) {
            try {
                const moduleUrl = `${pathToFileURL(fullPath).href}?update=${Date.now()}`
                const module = await import(moduleUrl)
                if (module.run) {
                    plugins.set(fullPath, module.run)
                }
            } catch (err) {
                console.error(chalk.red.bold(`[ ERROR ] Gagal meload plugin: ${fullPath}\n${err}`))
            }
        }
    }
}

const watchPlugins = () => {
    const watcher = chokidar.watch(path.join(__dirname, 'plugins'), { ignored: /^\./, persistent: true })
    watcher
        .on('add', async (filePath) => {
            if (filePath.endsWith('.js')) {
                const moduleUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`
                const module = await import(moduleUrl)
                if (module.run) plugins.set(filePath, module.run)
            }
        })
        .on('change', async (filePath) => {
            if (filePath.endsWith('.js')) {
                const moduleUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`
                const module = await import(moduleUrl)
                if (module.run) plugins.set(filePath, module.run)
            }
        })
        .on('unlink', (filePath) => {
            plugins.delete(filePath)
        })
}

const startBot = async () => {
    await loadPlugins(path.join(__dirname, 'plugins'))
    watchPlugins()

    console.log(chalk.cyan.bold(`[ INFO ] Berhasil memuat ${plugins.size} plugin.`))

    const { state, saveCreds } = await useMultiFileAuthState(config.pairing.auth)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: config.pairing.browser,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false
    })

    bindSocket(sock)

    if (!sock.authState.creds.registered && config.pairing.state) {
        const phoneNumber = config.pairing.number.toString()
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber, config.pairing.code)
            console.log(chalk.greenBright.bold(`[ ! ] Pairing Code : ${code.match(/.{1,4}/g)?.join('-')}`))
        }, 3000)
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr && !config.pairing.state) {
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) {
                startBot()
            } else {
                fs.removeSync(config.pairing.auth)
                startBot()
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold('Bot is ready to work!'))
        }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        await handler(sock, messages[0])
    })
}

process.on('uncaughtException', () => {})
process.on('unhandledRejection', () => {})

startBot()
