const Telegraf = require('telegraf')

const { useBroadcast } = require('../src')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(useBroadcast())

bot.command('/broadcast', ctx => {
    const replyMessage = ctx.message.reply_to_message

    if (replyMessage && replyMessage.text) {
        const userIds = [154674234, 154674235, 154674236, 154674237, 154674239];

        ctx.broadcast(userIds, replyMessage.text)
    }
})

bot.launch()
