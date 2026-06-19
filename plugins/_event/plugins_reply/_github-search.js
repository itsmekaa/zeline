global.db.githubSearch ??= {}

export const run = {
  event: async (ctx, { sock }) => {
    if (!ctx.text) return false

    const session = global.db.githubSearch?.[ctx.sender]
    if (!session) return false

    if (Date.now() > session.expired) {
      delete global.db.githubSearch[ctx.sender]
      return false
    }

    if (!/^(10|[1-9])$/.test(ctx.text.trim())) return false

    const repo = session.repos[Number(ctx.text.trim()) - 1]

    if (!repo) return false

    const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`

    let caption = `#> GitHub Download\n`
    caption += `- repository : ${repo.full_name}\n`
    caption += `- author : ${repo.owner.login}\n`
    caption += `- stars : ${repo.stargazers_count.toLocaleString()}\n`
    caption += `- forks : ${repo.forks_count.toLocaleString()}\n`
    caption += `- url : ${repo.html_url}\n`
    caption += `- description : ${repo.description || '-'}`

    await sock.sendMessage(
      ctx.chat,
      {
        document: {
          url: zipUrl
        },
        mimetype: 'application/zip',
        fileName: `${repo.name}.zip`,
        caption
      },
      {
        quoted: ctx
      }
    )

    return true
  }
}
