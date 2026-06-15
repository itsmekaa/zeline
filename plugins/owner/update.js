import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const REPO = 'itsmekaa/zeline'
const BRANCH = 'main'
const EXCLUDE = ['.env']

const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')

export const run = {
  cmd: ['update'],
  hidden: ['upd'],
  category: 'owner',
  settings: {
    owner: true
  },
  run: async (ctx, { sock }) => {
    const sent = await ctx.reply('Checking for updates...')

    const apiUrl = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`
    const res = await fetch(apiUrl)
    const data = await res.json()

    if (!data.tree) {
      await sock.sendMessage(ctx.chat, {
        text: 'Failed to fetch repository tree.',
        edit: sent.key
      })
      return
    }

    const files = data.tree.filter(
      f => f.type === 'blob' && !EXCLUDE.includes(path.basename(f.path))
    )

    let updated = []
    let failed = []

    for (const file of files) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${file.path}`
        const r = await fetch(rawUrl)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)

        const content = await r.text()
        const localPath = path.resolve(process.cwd(), file.path)

        const localExists = fs.existsSync(localPath)
        if (localExists) {
          const localContent = fs.readFileSync(localPath, 'utf8')
          if (sha256(localContent) === sha256(content)) continue
        }

        fs.mkdirSync(path.dirname(localPath), { recursive: true })
        fs.writeFileSync(localPath, content, 'utf8')
        updated.push(file.path)
      } catch {
        failed.push(file.path)
      }
    }

    if (!updated.length) {
      let msg = `Update completed\n\nNo files were changed`

      if (failed.length) {
        msg += `\n\nFailed (${failed.length}):\n${failed.map(f => `- ${f}`).join('\n')}`
      }

      await sock.sendMessage(ctx.chat, {
        text: msg.trim(),
        edit: sent.key
      })
      return
    }

    let msg = `Update completed\n\n`
    msg += `Updated (${updated.length}):\n${updated.map(f => `- ${f}`).join('\n')}\n\n`

    if (failed.length) {
      msg += `Failed (${failed.length}):\n${failed.map(f => `- ${f}`).join('\n')}\n\n`
    }

    msg += `Restarting...`

    await sock.sendMessage(ctx.chat, {
      text: msg.trim(),
      edit: sent.key
    })

    setTimeout(() => process.exit(0), 2000)
  }
}
