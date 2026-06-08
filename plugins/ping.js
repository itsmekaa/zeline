import os from "os"
import fs from "fs"

export const run = {
  cmd: ['ping'],
  hidden: ['p'],
  category: 'tools',
  run: async (ctx, { sock }) => {
    const start = Date.now()

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1)

    const formatSize = (bytes) => {
      if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
      if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB"
      return (bytes / 1024).toFixed(2) + " KB"
    }

    const msg = await ctx.reply("Testing latency...")

    const cap = `\`Server Information\`
* Running On : ${process.env.USER === "root" ? "VPS" : "HOSTING (PANEL)"}
* Cwd : ${process.cwd()}
* Tmp Dir : ${os.tmpdir()} *( ${fs.readdirSync(os.tmpdir()).length} Files )*
* Hostname : ${os.hostname()}
* Node Version : ${process.version}

\`Management Server\`
* Bot Speed : ${Date.now() - start} ms
* Uptime Bot : ${Func.toDate(process.uptime())}
* Uptime Server : ${Func.toDate(os.uptime())}
* Memory : ${formatSize(usedMem)} / ${formatSize(totalMem)} (${memPercent}%)
* CPU : ${os.cpus()[0].model} ( ${os.cpus().length} CORE )
* Release : ${os.release()}
* Type : ${os.type()}
* Arch : ${os.arch()}`

    await sock.sendMessage(ctx.chat, {
      text: cap,
      edit: msg.key
    })
  }
}
