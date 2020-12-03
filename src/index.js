const { Telegraf, Telegram } = require('telegraf')
const Queue = require('bull')

const getTelegramApi = (bot) => {
    if (bot instanceof Telegraf) {
        return bot.telegram
    }

    if (bot instanceof Telegram) {
        return bot
    }

    throw new Error('bot must be instance of Telegraf or Telegram')
}

class Broadcaster {
    static queueName = 'tg-broadcast'

    constructor(bot, options) {
        const defaultOptions = {
            processes: 1,
            queueName: Broadcaster.queueName,
            bullJobOptions: {},
            bullQueueOptions: {},
        }

        this.telegramApi = getTelegramApi(bot)
        this.options = { ...defaultOptions, ...options }

        this.usersProcessed = 0
        this.usersAmount = 0

        this.queue = new Queue(this.options.queueName, this.options.bullQueueOptions)
        this.queue.process(this.options.processes, this.processor)
    }

    processor = (job, done) => {
        const { chatId, fromChatId, messageId, messageText, extra } = job.data
    
        const doneSuccess = (res) => {
            this.usersProcessed += 1
            done(null, res)
        }
    
        const doneError = (err) => {
            this.usersProcessed += 1
            done(err)
        }
    
        if (messageId) {
            this.telegramApi.callApi('copyMessage', {
                chat_id: chatId,
                from_chat_id: fromChatId,
                message_id: messageId,
                ...extra,
            })
                .then(doneSuccess)
                .catch(doneError)
        } else {
            this.telegramApi.sendMessage(chatId, messageText, extra)
                .then(doneSuccess)
                .catch(doneError)
        }
    }

    run(chatIds, jobData) {
        this.usersProcessed = 0
        this.usersAmount = chatIds.length

        chatIds.forEach(chatId => {
            this.queue.add({ chatId, ...jobData }, this.options.bullJobOptions)
        })

        return this
    }

    sendText(chatIds, messageText, extra) {
        if (!Array.isArray(chatIds)) {
            throw new Error('chatIds must be an Array of chat/user ids')
        }

        if (typeof messageText !== 'string') {
            throw new Error('messageText must be a string')
        }

        return this.run(chatIds, {
            messageText,
            extra,
        })
    }

    sendMessage(chatIds, fromChatId, messageId, extra) {
        if (!Array.isArray(chatIds)) {
            throw new Error('chatIds must be an Array of chat/user ids')
        }

        if (typeof fromChatId !== 'number' || typeof messageId !== 'number') {
            throw new Error('fromChatId and messageId must be a number')
        }

        return this.run(chatIds, {
            fromChatId,
            messageId,
            extra,
        })
    }

    reset() {
        const queue = this.queue

        this.usersProcessed = 0
        this.usersAmount = 0

        return this.pause()
            .then(() => Promise.all([
                queue.empty(),
                queue.clean(0, 'delayed'),
                queue.clean(0, 'wait'),
                queue.clean(0, 'active'),
                queue.clean(0, 'completed'),
                queue.clean(0, 'failed'),
            ]))
    }

    terminate() {
        const queue = this.queue

        return this.pause()
            .then(() => Promise.all([
                queue.empty(),
                queue.clean(0, 'wait'),
                queue.clean(0, 'active'),
            ]))
    }

    pause() {
        return this.queue.pause()
    }

    resume() {
        return this.queue.resume()
    }

    progress() {
        const percent = ((this.usersProcessed * 100) / this.usersAmount)

        return Number.isNaN(percent) || !Number.isFinite(percent) ? 100 : percent
    }

    onCompleted(callback) {
        return this.queue.on('drained', callback)
    }

    onProcessed(callback) {
        return this.queue.on('completed', callback)
    }

    onFailed(callback) {
        return this.queue.on('failed', callback)
    }

    async failed(formatJob = false) {
        const failedJobs = await this.queue.getFailed()

        return failedJobs.map((job) => formatJob
            ? Broadcaster.formatFailedJob(job)
            : job,
        )
    }

    async status() {
        const queue = this.queue

        return {
            failedCount: await queue.getFailedCount(),
            completedCount: await queue.getCompletedCount(),
            activeCount: await queue.getActiveCount(),
            delayedCount: await queue.getDelayedCount(),
            waitingCount: await queue.getWaitingCount(),
        }
    }

    static formatFailedJob(job) {
        const { failedReason, data } = job

        if (!failedReason) {
            return { data }
        }

        const [code, status, message] = failedReason.split(':').map(str => str.trim())

        if (!parseInt(code)) {
            return { data, failedReason }
        }

        return {
            data,
            failedReason: {
                code: parseInt(code),
                status,
                message,
            }
        }
    }
}

module.exports = Broadcaster
