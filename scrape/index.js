import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const modules = {}

const load = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            await load(fullPath)
            continue
        }

        if (!entry.name.endsWith('.js') || entry.name === 'index.js') continue

        const module = await import(pathToFileURL(fullPath).href)

        Object.assign(modules, module)
    }
}

await load(__dirname)

export default modules
