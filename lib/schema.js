import { JSONFilePreset } from 'lowdb/node'
import mongoose from 'mongoose'
import { models } from './models.js'

const isMongo = Boolean(process.env.DATABASE_URL)

let data
let localDbInstance
let DatabaseModel

async function initMongo() {
  await mongoose.connect(process.env.DATABASE_URL)

  const dbSchema = new mongoose.Schema({
    users: { type: Object, default: {} },
    groups: { type: Object, default: {} },
    settings: { type: Object, default: {} }
  }, {
    minimize: false,
    strict: false
  })

  DatabaseModel = mongoose.models.Database || mongoose.model('Database', dbSchema)

  let doc = await DatabaseModel.findOne()
  if (!doc) {
    doc = await DatabaseModel.create({ users: {}, groups: {}, settings: {} })
  }

  return doc.toObject()
}

async function initLocal() {
  localDbInstance = await JSONFilePreset('db.json', {
    users: {},
    groups: {},
    settings: {}
  })

  return localDbInstance.data
}

data = isMongo ? await initMongo() : await initLocal()

function writeDB() {
  if (isMongo) {
    DatabaseModel.updateOne({}, {
      $set: {
        users: data.users,
        groups: data.groups,
        settings: data.settings
      }
    }).exec()
  } else {
    localDbInstance.write()
  }
}

function createProxy(targetObj) {
  const handler = {
    get(target, prop) {
      const value = target[prop]
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler)
      }
      return value
    },
    set(target, prop, value) {
      target[prop] = value
      writeDB()
      return true
    },
    deleteProperty(target, prop) {
      delete target[prop]
      writeDB()
      return true
    }
  }
  return new Proxy(targetObj, handler)
}

function initUser(users, m) {
  if (!m.sender || !m.sender.endsWith('@s.whatsapp.net')) return

  if (!users[m.sender]) {
    users[m.sender] = { ...models.users, name: m.pushName }
    return
  }

  Object.keys(models.users).forEach(key => {
    if (typeof users[m.sender][key] === 'undefined') {
      users[m.sender][key] = models.users[key]
    }
  })
}

function initGroup(groups, m) {
  if (!m.isGroup) return

  if (!groups[m.chat]) {
    groups[m.chat] = { ...models.groups }
    return
  }

  Object.keys(models.groups).forEach(key => {
    if (typeof groups[m.chat][key] === 'undefined') {
      groups[m.chat][key] = models.groups[key]
    }
  })
}

function initSettings(settings) {
  Object.keys(models.settings).forEach(key => {
    if (typeof settings[key] === 'undefined') {
      settings[key] = models.settings[key]
    }
  })
}

export const db = {
  users: createProxy(data.users),
  groups: createProxy(data.groups),
  settings: createProxy(data.settings),

  init: async function (m) {
    initUser(this.users, m)
    initGroup(this.groups, m)
    initSettings(this.settings)
  }
}