import os from 'os'

export const run = {
 cmd: ['ping'],
 hidden: ['p'],
 category: 'miscs',
 description: 'show server status',
 run: async (m, { sock }) => {
 const totalMem = process.env.SERVER_MEMORY * 1024 * 1024 || os.totalmem()
 const usedMem = process.memoryUsage().rss

 const loadAvg = os.loadavg()
 const loadText = loadAvg.map(v => v.toFixed(2)).join(', ')

 const cap = `\`Server Information\`
* Running On : ${process.env.USER === "root" ? "VPS" : "HOSTING (PANEL)"}
* Cwd : ${process.cwd()}
* Hostname : ${os.hostname()}
* Node Version : ${process.version}
* Platform : ${os.platform()}
* Tmp Dir : ${os.tmpdir()}
* Load Average : ${loadText}

\`Management Server\`
* Bot Speed : ${Date.now() - m.timestamps} ms
* Uptime Bot : ${Func.toDate(process.uptime())}
* Uptime Server : ${Func.toDate(os.uptime())}
* Memory : ${(usedMem / 1024 / 1024).toFixed(0)} MiB / ${(totalMem / 1024 / 1024).toFixed(0)} MiB
* CPU : ${os.cpus()[0].model} ( ${os.cpus().length} CORE )
* Release : ${os.release()}
* Arch : ${os.arch()}`

 await m.reply(cap)
 }
}
