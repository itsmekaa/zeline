export const models = {
  users: {
    name: '',
    totalChat: 0
  },
  groups: {
    welcome: {
      enabled: true,
      text: 'welcome @user to @group!\ntime: @time'
    },
    leave: {
      enabled: true,
      text: 'goodbye @user from @group!\ntime: @time'
    },
    antilink: false
  },
  settings: {
    self: false,
    autoread: false,
    queue: true
  },
  plugins: {}
}
