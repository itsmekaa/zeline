export const models = {
    users: {
        name: ''
    },
    groups: {
        antilink: false,
        welcome: {
            enabled: true,
            text: 'welcome @user to @group!'
        },
        leave: {
            enabled: true,
            text: 'goodbye @user from @group!'
        }
    },
    settings: {
        self: false,
        autoread: false,
        queue: true,
        whitelist: {
          enabled: false,
          id: []
        }
    }
}
