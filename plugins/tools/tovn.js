import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

export const run = {
  cmd: ['tovn'],
  category: 'tools',
  run: async (m, { prefix, command }) => {
    if (
      !(
        m.type === 'videoMessage' ||
        m.type === 'audioMessage' ||
        (m.quoted && (m.quoted.type === 'videoMessage' || m.quoted.type === 'audioMessage'))
      )
    ) {
      return m.reply(Func.usage(prefix, command, '(reply / send audio or video)'))
    }

    await m.reply(config.msg.wait)

    try {
      const media = (m.quoted && (m.quoted.type === 'videoMessage' || m.quoted.type === 'audioMessage')) ? m.quoted : m
      const buffer = await media.download()
      
      const tmpIn = path.join(process.cwd(), '.tmp', `tmp_${Date.now()}_in`)
      const tmpOut = path.join(process.cwd(), '.tmp', `tmp_${Date.now()}_out.ogg`)
      
      fs.writeFileSync(tmpIn, buffer)
      
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tmpIn} -vn -c:a libopus -b:a 16k -vbr on -compression_level 10 ${tmpOut}`, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      
      const audioBuffer = fs.readFileSync(tmpOut)
      const waveform = new Uint8Array(Array.from({ length: 64 }, () => Math.floor(Math.random() * 100)))
      
      await m.reply({
        audio: audioBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        waveform: waveform
      })
      
      fs.unlinkSync(tmpIn)
      fs.unlinkSync(tmpOut)
    } catch (e) {
      console.log(e)
      m.reply(config.msg.error)
    }
  }
}
