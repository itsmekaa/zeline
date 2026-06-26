import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: true,
  maxVersion: 'TLSv1.3',
  minVersion: 'TLSv1.2'
});

const getCookies = async () => {
  try {
    const { headers } = await axios.get(
      'https://www.pinterest.com/csrf_error/',
      {
        httpsAgent: agent
      }
    );

    const cookies = headers['set-cookie'];
    if (!cookies) return null;

    return cookies
      .map((v) => v.split(';')[0].trim())
      .join('; ');
  } catch {
    return null;
  }
};

const resolveTimestamp = (result) => {
  if (result.created_at_timestamp) return result.created_at_timestamp;
  if (result.created_at_unix) return result.created_at_unix;

  if (result.created_at && !isNaN(Date.parse(result.created_at))) {
    return Math.floor(new Date(result.created_at).getTime() / 1000);
  }

  if (result.timestamp) return result.timestamp;

  return null;
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Tidak diketahui';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(timestamp * 1000));
};

export const pinterest = async (query) => {
  try {
    const cookies = await getCookies();
    if (!cookies) return [];

    const { data } = await axios.get(
      'https://www.pinterest.com/resource/BaseSearchResource/get/',
      {
        httpsAgent: agent,
        params: {
          source_url: `/search/pins/?q=${query}`,
          data: JSON.stringify({
            options: {
              isPrefetch: false,
              query,
              scope: 'pins',
              no_fetch_context_on_resource: false
            },
            context: {}
          }),
          _: Date.now()
        },
        headers: {
          accept: 'application/json, text/javascript, */*, q=0.01',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.9',
          cookie: cookies,
          dnt: '1',
          referer: 'https://www.pinterest.com/',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
          'x-app-version': 'c056fb7',
          'x-pinterest-appstate': 'active',
          'x-pinterest-pws-handler': 'www/[username]/[slug].js',
          'x-pinterest-source-url': '/hargr003/cat-pictures/',
          'x-requested-with': 'XMLHttpRequest'
        }
      }
    );

    const results =
      data.resource_response?.data?.results?.filter((v) => v.images?.orig) || [];

    return results.map((v) => ({
      id: v.id,
      upload_by: v.pinner?.username,
      fullname: v.pinner?.full_name,
      followers: v.pinner?.follower_count,
      title: v.grid_title,
      image: v.images.orig.url,
      source: `https://id.pinterest.com/pin/${v.id}`,
      upload_date: formatDate(resolveTimestamp(v))
    }));
  } catch {
    return [];
  }
};
