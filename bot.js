const Telegraf = require('telegraf')

const { useBroadcast } = require('./src')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(useBroadcast())

bot.start(async (ctx) => {
    await ctx.reply(ctx.from.id)

    return ctx.broadcast([155054210, 520071705], 'Hello')
})

bot.launch()
