import axios from 'axios'
import crypto from 'crypto'
import sharp from 'sharp'

const API = 'https://a.android.api.remini.ai/v1/mobile'
const ORACLE = 'https://api.remini.ai/v1/mobile/oracle'

let token = null
let device = genId()

function genId() {
  const a = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

  return {
    android_id: a,
    aaid: crypto.randomUUID(),
    backup_persistent_id: `${a}_com.bigwinepot.nwdn.international`,
    non_backup_persistent_id: crypto.randomUUID()
  }
}

function baseHeaders(extra = {}) {
  return {
    'bsp-id': 'com.bigwinepot.nwdn.international.android',
    'build-number': '202514479',
    'build-version': '3.7.1020',
    country: 'US',
    'device-manufacturer': 'Samsung',
    'device-model': 'SM-G998B',
    'device-type': '6.8',
    language: 'en',
    locale: 'en_US',
    'os-version': '33',
    platform: 'Android',
    timezone: 'America/New_York',
    'android-id': device.android_id,
    aaid: device.aaid,
    'accept-encoding': 'gzip',
    'user-agent': 'okhttp/4.12.0',
    ...extra
  }
}

function authHeaders(extra = {}) {
  return {
    ...baseHeaders(extra),
    ...(token ? { 'identity-token': token } : {})
  }
}

async function auth() {
  device = genId()

  const { data } = await axios.get(`${ORACLE}/setup`, {
    headers: baseHeaders({
      'first-install-timestamp': `${Math.floor(Date.now() / 1000)}E9`,
      'backup-persistent-id': device.backup_persistent_id,
      'non-backup-persistent-id': device.non_backup_persistent_id,
      environment: 'Production',
      'settings-response-version': 'v2',
      'is-app-running-in-background': 'false',
      'is-old-user': 'true',
      'app-set-id': 'd44bd45a-a45d-4470-9674-7348a8e3fb71'
    })
  })

  token = data.settings.__identity__.token

  if (!token) throw new Error('Failed get token')

  await axios.get(`${API}/users/@me`, {
    headers: authHeaders()
  })
}

export const remini = async (buffer) => {
  try {
    await auth()

    const meta = await sharp(buffer).metadata()

    const md5 = crypto
      .createHash('md5')
      .update(buffer)
      .digest('base64')

    const mime = `image/${meta.format === 'jpg' ? 'jpeg' : meta.format}`

    const { data: task } = await axios.post(
      `${API}/tasks`,
      {
        image_content_type: mime,
        image_md5: md5,
        feature: {
          type: 'enhance',
          models: []
        },
        metadata: {
          size: buffer.length,
          width: meta.width,
          height: meta.height
        },
        options: {
          high_quality_output: false,
          save_input: true
        }
      },
      {
        headers: {
          ...authHeaders(),
          'content-type': 'application/json; charset=UTF-8'
        }
      }
    )

    if (!task.task_id) {
      throw new Error('Failed create task')
    }

    await axios.put(task.upload_url, buffer, {
      headers: {
        ...task.upload_headers,
        'Content-Length': buffer.length,
        'User-Agent': 'okhttp/4.12.0'
      },
      maxBodyLength: Infinity
    })

    await axios.post(
      `${API}/tasks/${task.task_id}/process`,
      null,
      {
        headers: authHeaders({
          'content-length': '0'
        })
      }
    )

    let outputUrl

    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 5000))

      const { data } = await axios.get(
        `${API}/tasks/${task.task_id}`,
        {
          headers: authHeaders()
        }
      )

      if (data.status === 'completed') {
        outputUrl = data.result?.outputs?.[0]?.url
        break
      }

      if (['failed', 'error'].includes(data.status)) {
        throw new Error('Task failed')
      }
    }

    if (!outputUrl) {
      throw new Error('Output URL not found')
    }

    const { data } = await axios.get(outputUrl, {
      responseType: 'arraybuffer'
    })

    return Buffer.from(data)
  } catch (e) {
    throw new Error(
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.message
    )
  }
}
