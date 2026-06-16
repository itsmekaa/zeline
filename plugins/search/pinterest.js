import axios from "axios";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: true,
  maxVersion: "TLSv1.3",
  minVersion: "TLSv1.2",
});

class PinterestService {
  static async getCookies() {
    try {
      const response = await axios.get("https://www.pinterest.com/csrf_error/", { httpsAgent: agent });
      const setCookieHeaders = response.headers["set-cookie"];
      if (setCookieHeaders) {
        const cookies = setCookieHeaders.map((cookieString) => {
          const cookieParts = cookieString.split(";");
          const cookieKeyValue = cookieParts[0].trim();
          return cookieKeyValue;
        });
        return cookies.join("; ");
      }
      return null;
    } catch {
      return null;
    }
  }

  static resolveTimestamp(result) {
    if (result.created_at_timestamp) return result.created_at_timestamp;
    if (result.created_at_unix) return result.created_at_unix;
    if (result.created_at && !isNaN(Date.parse(result.created_at)))
      return Math.floor(new Date(result.created_at).getTime() / 1000);
    if (result.timestamp) return result.timestamp;
    return null;
  }

  static formatDate(timestamp) {
    if (!timestamp) return "Tidak diketahui";
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  static async search(query) {
    try {
      const cookies = await this.getCookies();
      if (!cookies) return [];

      const url = "https://www.pinterest.com/resource/BaseSearchResource/get/";
      const params = {
        source_url: `/search/pins/?q=${query}`,
        data: JSON.stringify({
          options: {
            isPrefetch: false,
            query: query,
            scope: "pins",
            no_fetch_context_on_resource: false,
          },
          context: {},
        }),
        _: Date.now(),
      };

      const headers = {
        accept: "application/json, text/javascript, */*, q=0.01",
        "accept-encoding": "gzip, deflate",
        "accept-language": "en-US,en;q=0.9",
        cookie: cookies,
        dnt: "1",
        referer: "https://www.pinterest.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        "x-app-version": "c056fb7",
        "x-pinterest-appstate": "active",
        "x-pinterest-pws-handler": "www/[username]/[slug].js",
        "x-pinterest-source-url": "/hargr003/cat-pictures/",
        "x-requested-with": "XMLHttpRequest",
      };

      const { data } = await axios.get(url, {
        httpsAgent: agent,
        headers: headers,
        params: params,
      });

      const container = [];
      const results = data.resource_response?.data?.results?.filter((v) => v.images?.orig) || [];
      results.forEach((result) => {
        container.push({
          id: result.id,
          upload_by: result.pinner?.username,
          fullname: result.pinner?.full_name,
          followers: result.pinner?.follower_count,
          title: result.grid_title,
          image: result.images.orig.url,
          source: "https://id.pinterest.com/pin/" + result.id,
          upload_date: this.formatDate(this.resolveTimestamp(result)),
        });
      });

      return container;
    } catch {
      return [];
    }
  }
}

export const run = {
  cmd: ['pinterest'],
  hidden: ['pin', 'pins'],
  category: 'search',
  run: async (ctx, { prefix, command, sock, text }) => {
    if (!text) {
      return ctx.reply(Func.usage(prefix, command, 'wallpaper'))
    }

    ctx.reply(config.msg.wait)

    try {
      const results = await PinterestService.search(text)
      if (!results || results.length === 0) {
        return ctx.reply('Tidak ada hasil ditemukan.')
      }

      const images = results.slice(0, 4).map((item) => item.image)

      const metadata = results.slice(0, 4).map((item, i) =>
  `${i + 1}.\n- title : ${item.title || ''}\n- author : ${item.upload_by || 'unknown'}\n- time : ${item.upload_date}`
).join('\n\n')

      const caption =
        `#> Pinterest Search\n` +
        `- query : ${text}\n` +
        `- result : ${images.length}\n\n` +
        `#> Result Metadata\n` +
        metadata

      if (images.length > 1) {
        await sock.sendAlbum(ctx.chat, images, { caption, delay: 1000, quoted: ctx })
      } else {
        await ctx.reply({
          image: { url: images[0] },
          caption
        })
      }
    } catch (e) {
      console.log(e.message)
      ctx.reply(config.msg.error)
    }
  }
}
