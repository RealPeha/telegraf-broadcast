const { Telegram } = require('telegraf')
const Broadcaster = require('telegraf-broadcast')

const telegram = new Telegram(process.env.TOKEN)
const broadcaster = new Broadcaster(telegram)

const userIds = [155054210, 669662547, 1]

broadcaster.sendText(userIds, '<b>Hello everyone</b>', { parse_mode: 'HTML' })

broadcaster.onCompleted(() => console.log('Broadcasting is completed'))
broadcaster.onProcessed(() => console.log(`Progress: ${broadcaster.progress()}%`))
broadcaster.onFailed(job => {
    const failedJob = Broadcaster.formatFailedJob(job)

    console.error(`User with id ${failedJob.data.chatId} did not receive the message. Reason: ${failedJob.failedReason.message}`)
})
