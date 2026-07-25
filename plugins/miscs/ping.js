import os from 'os'
import { execSync } from 'child_process'

export const run = {
  cmd: ['ping'],
  hidden: ['p'],
  category: 'miscs',
  description: 'show server status',
  run: async (m, { sock }) => {
    const totalMem = process.env.SERVER_MEMORY * 1024 * 1024 || os.totalmem()
    const usedMem = process.memoryUsage().rss

    let osName = os.type() + ' ' + os.release()
    try {
      const rel = execSync('cat /etc/os-release').toString()
      const m2 = rel.match(/PRETTY_NAME="(.+)"/)
      if (m2) osName = m2[1]
    } catch {}

    let storage = 'N/A'
    try {
      const df = execSync('df -h / --output=used,size').toString().trim().split('\n')
      const parts = df[1].trim().split(/\s+/)
      storage = parts[0] + ' / ' + parts[1]
    } catch {}

    const cap = `# *Software*
› cwd : ${process.cwd()}
› platform : ${osName}
› kernel : ${os.release()}
› environment : Node.js ${process.version}

# *Hardware*
› memory : ${(usedMem / 1024 / 1024).toFixed(0)} MiB / ${(totalMem / 1024 / 1024).toFixed(0)} MiB
› storage : ${storage}
› cpu : ${os.cpus()[0].model}
› uptime : ${Func.toDate(os.uptime())}

# *Bot*
› latency : ${Date.now() - m.timestamps} ms
› uptime : ${Func.toDate(process.uptime())}`

    await m.reply(cap)
  }
}
