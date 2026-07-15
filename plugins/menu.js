import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import {
    prepareWAMessageMedia
} from 'baileys'

const pkg = JSON.parse(
    fs.readFileSync(
        path.resolve(process.cwd(), 'package.json'),
        'utf8'
    )
)

export const run = {
    cmd: ['menu'],
    hidden: ['m'],
    run: async (m, {
        sock
    }) => {
        const categories = {}

        for (const [, plugin] of globalThis.plugins.entries()) {
            if (!plugin.category || !plugin.cmd) continue

            if (!categories[plugin.category]) {
                categories[plugin.category] = []
            }

            for (const cmd of plugin.cmd) {
                categories[plugin.category].push({
                    cmd,
                    description: plugin.description || 'no description'
                })
            }
        }

        const time = moment().tz(config.tz).format('HH:mm:ss')

        let text = `Hi @${m.sender.split('@')[0]} !\n\n`
        text += '`Bot Information`\n'
        text += `- *Name*: ${pkg.name}\n`
        text += `- *Version*: ${pkg.version}\n`
        text += `- *Prefix*: ${config.prefix.join(' · ')}\n`
        text += `- *Time*: ${time}\n\n`

        text += '`User Information`\n'
        text += `- *Name*: ${m.pushName}\n`
        text += `- *Number*: ${m.sender.split('@')[0]}\n`
        text += `- *Status*: ${m.isOwner ? 'Owner' : 'Free User'}\n\n`

        for (const cat of Object.keys(categories).sort()) {
            const cmds = categories[cat]
                .filter((v, i, arr) => arr.findIndex(x => x.cmd === v.cmd) === i)
                .sort((a, b) => a.cmd.localeCompare(b.cmd))

            text += `# *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${cmds.length})\n`

            cmds.forEach(item => {
                text += `› ${m.prefix + item.cmd} - *${item.description}*\n`
            })

            text += '\n'
        }

        const urlB = 'https://github.com/itsmekaa/zeline'

        const {
            imageMessage: image
        } = await prepareWAMessageMedia({
            image: {
                url: 'media/image/icon.jpg'
            }
        }, {
            upload: sock.waUploadToServer,
            mediaTypeOverride: 'thumbnail-link'
        })

        image.height = 405
        image.width = 720

        await sock.sendMessage(
            m.chat, {
                text: urlB + ` ${text.trim()}`,
                mentions: [m.sender],
                linkPreview: {
                    'matched-text': urlB,
                    title: pkg.name,
                    description: 'WhatsApp Bot',
                    previewType: 0,
                    jpegThumbnail: fs.readFileSync('media/image/icon.jpg'),
                    highQualityThumbnail: image,
                    linkPreviewMetadata: {
                        linkMediaDuration: 0,
                        socialMediaPostType: 0
                    }
                }
            }, {
                quoted: m
            }
        )
    }
}
