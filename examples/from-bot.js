const { Telegraf } = require('telegraf')

const Broadcaster = require('../src')

const bot = new Telegraf(process.env.TOKEN)

const broadcaster = new Broadcaster(bot)
broadcaster.pause()

bot.command('/broadcast', ctx => {
    const replyMessage = ctx.message.reply_to_message

    if (replyMessage) {
        const userIds = [155054210, 669662547]

        broadcaster.broadcast(userIds, {
            fromChatId: ctx.chat.id,
            messageId: replyMessage.message_id,
        })
    }
})

bot.command('/stop', () => {
    return broadcaster.pause()
})

bot.command('/run', () => {
    return broadcaster.resume()
})

bot.command('/reset', () => {
    return broadcaster.reset()
})

bot.command('/terminate', () => {
    return broadcaster.terminate()
})

bot.command('/status', async ctx => {
    const { failedCount, completedCount, waitingCount } = await broadcaster.status()

    return ctx.reply(
        '<code>' +
            `waiting: ${waitingCount}\n` +
            `failed: ${failedCount}\n` +
            `completed: ${completedCount}` +
        '</code>',
        { parse_mode: 'HTML' }
    )
})

bot.launch()
