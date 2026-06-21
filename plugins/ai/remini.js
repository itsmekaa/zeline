import axios from 'axios'

export const run = {
  cmd: ['remini'],
  hidden: ['upscale', 'hd'],
  category: 'ai',
  run: async (ctx) => {

    if (
      !(
        ctx.type === 'imageMessage' ||
        (ctx.quoted && ctx.quoted.type === 'imageMessage')
      )
    ) {
      return ctx.reply(`# Cara penggunaan\n> kirim / reply gambar dengan ${ctx.prefix + ctx.command}`)
    }

    await ctx.reply(config.msg.wait)

    try {
      const media =
        ctx.quoted && ctx.quoted.type === 'imageMessage'
          ? ctx.quoted
          : ctx

      const buffer = await media.download()
      const up = await uploader.uguu(buffer)

      const api = `${config.api.baseUrl.anabot}/api/ai/toEnhance?imageUrl=${encodeURIComponent(up)}&apikey=freeApikey`
      const { data: result } = await axios.get(api)

      if (!result.success || !result.data?.result) {
        return ctx.reply(JSON.stringify(result, null, 2))
      }

      await ctx.reply({ image: { url: result.data.result } })

    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
