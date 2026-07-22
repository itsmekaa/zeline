import util from 'util'
import { exec } from 'child_process'

const safeStringify = (obj) => {
  const seen = new WeakSet()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') return undefined
    if (value instanceof Uint8Array) return `<Buffer ${value.length} bytes>`
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return value
  }, 2)
}

export const run = {
  event: async (m, { sock }) => {
    if (!m.isOwner || !m.text) return false

    let prefix = null
    let text = null

    if (m.text.startsWith('=>')) {
      prefix = '=>'
      text = m.text.slice(2).trim()
    } else if (m.text.startsWith('>')) {
      prefix = '>'
      text = m.text.slice(1).trim()
    } else if (m.text.startsWith('$')) {
      prefix = '$'
      text = m.text.slice(1).trim()
    } else {
      return false
    }

    if (!text) {
      await m.reply(prefix === '$' ? 'enter terminal command.' : 'enter javascript code.')
      return true
    }

    if (prefix === '=>' || prefix === '>') {
      try {
        const evaled = (prefix === '>')
          ? await eval(`(${text})`)
          : await (async () => eval(`(async () => { ${text} })()`))()

        const result = typeof evaled !== 'string' ? safeStringify(evaled) : evaled
        await m.reply(String(result))
      } catch (e) {
        await m.reply(util.format(e))
      }
      return true
    }

    if (prefix === '$') {
      exec(text, (error, stdout, stderr) => {
        if (stdout) return m.reply(util.format(stdout).trim())
        if (stderr) return m.reply(util.format(stderr).trim())
        if (error) return m.reply(util.format(error.message).trim())
      })
      return true
    }
  }
}
