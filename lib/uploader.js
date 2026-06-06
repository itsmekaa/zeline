import { Blob } from 'buffer'

export const skyzxu = async (buffer) => {
  try {
    const blob = new Blob([buffer])
    const formData = new FormData()
    
    formData.append('file', blob, `${Date.now()}.png`) 

    const response = await fetch('https://skyzxu-uploader.hf.space/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'success') {
      return data.url
    } else {
      throw new Error('Gagal mengupload file: Status bukan success')
    }

  } catch (error) {
    console.error('Terjadi kesalahan saat mengupload gambar:', error)
    throw error
  }
}