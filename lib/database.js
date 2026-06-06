import { JSONFilePreset } from 'lowdb/node'
import fs from 'fs-extra'
import util from 'util'

await fs.ensureDir('database')

const RAW = Symbol('RAW')

const usersDb = await JSONFilePreset('database/users.json', {})
const groupsDb = await JSONFilePreset('database/groups.json', {})
const settingsDb = await JSONFilePreset('database/settings.json', {})

const createProxy = (dbInstance) => {
  const handler = {
    get(target, prop) {
      if (prop === RAW) return target
      const value = target[prop]
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler)
      }
      return value
    },
    set(target, prop, value) {
      target[prop] = value
      dbInstance.write()
      return true
    },
    deleteProperty(target, prop) {
      delete target[prop]
      dbInstance.write()
      return true
    }
  }
  return new Proxy(dbInstance.data, handler)
}

export const db = {
  users: createProxy(usersDb),
  groups: createProxy(groupsDb),
  settings: createProxy(settingsDb),
  init: async function (ctx) {
    if (ctx.sender && ctx.sender.endsWith('@s.whatsapp.net')) {
      if (!this.users[ctx.sender]) {
        this.users[ctx.sender] = { 
          name: ctx.pushName, 
          totalChat: 1 
        }
      } else {
        if (this.users[ctx.sender].name !== ctx.pushName) {
          this.users[ctx.sender].name = ctx.pushName
        }
        this.users[ctx.sender].totalChat = (this.users[ctx.sender].totalChat || 0) + 1
      }
    }

    if (ctx.isGroup) {
      if (!this.groups[ctx.chat]) {
        this.groups[ctx.chat] = { antilink: false, welcome: false }
      }
    }

    if (typeof this.settings.self === 'undefined') {
      this.settings.self = false
    }
  },
  [util.inspect.custom]() {
    return {
      users: this.users[RAW],
      groups: this.groups[RAW],
      settings: this.settings[RAW]
    }
  }
}
