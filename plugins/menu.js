import moment from 'moment-timezone'
import pkg from '../package.json'
with {
    type: 'json'
}

export const run = {
    cmd: ['menu'],
    hidden: ['m'],
    run: async (m) => {
        const categories = {}

        for (const [, plugin] of globalThis.plugins.entries()) {
            if (!plugin.category || !plugin.cmd) continue

            if (!categories[plugin.category]) {
                categories[plugin.category] = []
            }

            for (const cmd of plugin.cmd) {
                categories[plugin.category].push({
                    cmd,
                    description: plugin.description || '(no description)'
                })
            }
        }

        const time = moment().tz(config.tz).format('HH:mm:ss')

        let caption = `Hi @${m.sender.split('@')[0]} !\n\n`
        caption += '`Bot Information`\n'
        caption += `- *Name*: ${pkg.name}\n`
        caption += `- *Version*: ${pkg.version}\n`
        caption += `- *Prefix*: ${config.prefix.join(' · ')}\n`
        caption += `- *Time*: ${time}\n\n`

        caption += '`User Information`\n'
        caption += `- *Name*: ${m.pushName}\n`
        caption += `- *Number*: ${m.sender.split('@')[0]}\n`
        caption += `- *Status*: ${m.isOwner ? 'Owner' : 'Free User'}\n\n`

        for (const cat of Object.keys(categories).sort()) {
            const cmds = categories[cat]
                .filter((v, i, arr) => arr.findIndex(x => x.cmd === v.cmd) === i)
                .sort((a, b) => a.cmd.localeCompare(b.cmd))

            caption += `# *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${cmds.length})\n`

            cmds.forEach(item => {
                caption += `› ${m.prefix + item.cmd} - *(${item.description})*\n`
            })

            caption += '\n'
        }

        caption += `> ${config.style.footer}`

        await m.reply(caption.trim(), {
            mentions: [m.sender]
        })
    }
}
