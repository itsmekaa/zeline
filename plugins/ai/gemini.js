import axios from 'axios'
import moment from 'moment-timezone'

export const run = {
  cmd: ['gemini'],
  hidden: ['ai'],
  category: 'ai',
  run: async (ctx, { text }) => {
    if (!text) return ctx.reply(`# Cara penggunaan\n> ${ctx.prefix + ctx.command} halo`)
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.api.key.gemini}`
      
      const timeNow = moment().tz(config.tz).format('dddd, DD MMMM YYYY HH:mm:ss')
      
      const payload = {
        systemInstruction: {
          parts: [
            {
              text: `Kamu adalah asisten AI yang terhubung dengan WhatsApp. Waktu saat ini di zona ${config.tz} adalah ${timeNow}. Jawab dengan santai dan natural.`
            }
          ]
        },
        tools: [
          {
            googleSearch: {}
          }
        ],
        contents: [
          {
            parts: [
              {
                text: text
              }
            ]
          }
        ]
      }

      const { data } = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = data.candidates[0].content.parts[0].text
      await ctx.reply(result.trim())
    } catch (error) {
      console.log(error.message)
      ctx.reply(config.msg.error)
    }
  }
}