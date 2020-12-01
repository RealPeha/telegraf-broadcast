const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.TOKEN)

bot.start(ctx => {
    return ctx.reply('Hello')
})

module.exports = bot
