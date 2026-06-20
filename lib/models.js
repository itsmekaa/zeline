export const models = {
  users: {
    name: '',
    totalChat: 0,
    rpg: {
      level: 1,
      exp: 0,
      gold: 100,
      hp: 100,
      maxHp: 100,
      lastDaily: 0,
      attack: 10,
      defense: 5,
      inventory: {
        potion: 3,
        kayu: 0,
        batu: 0,
        iron: 0,
        wood: 0,
        fish: 0
      },
      kills: 0,
      cooldown: {
        hunt: 0,
        mine: 0,
        fish: 0,
        daily: 0
      }
    }
  },
  groups: {
    antilink: false,
    welcome: false
  },
  settings: {
    self: false,
    autoread: false,
    antrian: true
  }
}