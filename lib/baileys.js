import {
    generateWAMessageFromContent
} from 'baileys';

export const bindSocket = (sock) => {

    sock.sendText = async (jid, text, options = {}) => {
        try {
            if (!text) throw new Error('Text tidak boleh kosong.');

            return await sock.sendMessage(
                jid,
                { text },
                options
            );
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return sock;
};
