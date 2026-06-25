db.event ??= {}
db.event.tiktokSearch ??= {}

export const run = {
  event: async (m, { sock }) => {
    if (!m.text) return false

    const session = db.event.tiktokSearch?.[m.sender]
    if (!session) return false

    if (Date.now() > session.expired) {
      delete db.event.tiktokSearch[m.sender]
      return false
    }

    if (!/^(10|[1-9])$/.test(m.text.trim())) return false

    const video = session.videos[Number(m.text.trim()) - 1]

    if (!video) return false

    let caption = `#> TikTok Download\n`
    caption += `- title : ${video.title || '-'}\n`
    caption += `- author : ${video.author?.nickname || '-'}\n`
    caption += `- region : ${video.region || '-'}\n`
    caption += `- views : ${Func.h2k(video.play_count || 0)}\n`
    caption += `- likes : ${Func.h2k(video.digg_count || 0)}\n`
    caption += `- comment : ${Func.h2k(video.comment_count || 0)}`

    await sock.sendMessage(
      m.chat,
      {
        video: {
          url: video.play
        },
        caption
      },
      {
        quoted: m
      }
    )

    delete db.event.tiktokSearch[m.sender]

    return true
  }
}
