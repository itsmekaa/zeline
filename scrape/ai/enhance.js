import axios from 'axios'
import FormData from 'form-data'

export const enhance = async (buffer, size = 'high') => {
  try {
    const valid = ['low', 'medium', 'high']
    if (!valid.includes(size)) throw new Error('Size tidak valid')

    const form = new FormData()
    form.append('method', '1')
    form.append('is_pro_version', 'false')
    form.append('is_enhancing_more', 'false')
    form.append('max_image_size', size)
    form.append('file', buffer, `enhance_${Date.now()}.jpg`)

    const { data } = await axios.post(
      'https://ihancer.com/api/enhance',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'accept-encoding': 'gzip',
          host: 'ihancer.com',
          'user-agent': 'Dart/3.5 (dart:io)'
        },
        responseType: 'arraybuffer'
      }
    )

    return Buffer.from(data)
  } catch (e) {
    throw new Error(e.response?.data?.message || e.message)
  }
}
