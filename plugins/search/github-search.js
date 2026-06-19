import axios from 'axios'

global.db.event.githubSearch ??= {}

export const run = {
  cmd: ['githubsearch'],
  hidden: ['ghs'],
  category: 'search',
  run: async (ctx, { text, command, prefix }) => {
    try {
      if (!text) {
        return ctx.reply(Func.usage(prefix, command, 'whatsapp bot'))
      }

      const { data } = await axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=10`
      )

      if (!data.items?.length) {
        return ctx.reply('Repository tidak ditemukan')
      }

      global.db.event.githubSearch[ctx.sender] = {
        repos: data.items,
        expired: Date.now() + 60000
      }

      let caption = `#> GitHub Search\n`
      caption += `- query : ${text}\n`
      caption += `- result : ${data.items.length}\n\n`
      caption += `#> Result Metadata\n`

      data.items.forEach((repo, i) => {
        caption += `\n${i + 1}.\n`
        caption += `- repository : ${repo.full_name}\n`
        caption += `- author : ${repo.owner.login}\n`
        caption += `- stars : ${repo.stargazers_count.toLocaleString()}\n`
        caption += `- forks : ${repo.forks_count.toLocaleString()}\n`
        caption += `- url : ${repo.html_url}\n`
        caption += `- description : ${repo.description || '-'}\n`
      })

      caption += `\n\nKirim angka 1 - ${data.items.length} untuk download repository.\nExpired dalam 1 menit.`

      await ctx.reply(caption)
    } catch (e) {
      console.error(e)
      ctx.reply(config.msg.error)
    }
  }
}
