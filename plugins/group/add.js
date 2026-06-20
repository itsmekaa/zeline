export const run = {
  cmd: ['add'],
  category: 'group',
  settings: {
    admin: true,
    group: true
  },
  run: async (ctx, { sock, prefix, command, text }) => {
    let targets = ctx.message?.extendedTextMessage?.contextInfo?.mentionedJid || ctx.mentionedJid || [];

    if (targets.length === 0 && ctx.quoted) {
      targets = [ctx.quoted.sender];
    }

    if (targets.length === 0 && text) {
      targets = text.split(' ')
        .map(n => n.replace(/\D/g, ''))
        .filter(n => n.length > 5)
        .map(n => n + '@s.whatsapp.net');
    }

    if (targets.length === 0) {
      return ctx.reply(Func.usage(prefix, command, '@someone'));
    }

    const result = await sock.groupParticipantsUpdate(ctx.chat, targets, 'add');
    // ctx.reply(JSON.stringify(result, null, 2));
  }
}
