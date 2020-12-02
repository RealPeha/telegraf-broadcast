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
    constructor(bot, bullQueueOptions) {
        const telegramApi = getTelegramApi(bot)
        
        this.usersProcessed = 0
        this.usersAmount = 0

        this.queue = new Queue('broadcast', bullQueueOptions)
        this.queue.process((job, done) => {
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
                telegramApi.callApi('copyMessage', {
                    chat_id: chatId,
                    from_chat_id: fromChatId,
                    message_id: messageId,
                    ...extra,
                })
                    .then(doneSuccess)
                    .catch(doneError)
            } else {
                telegramApi.sendMessage(chatId, messageText, extra)
                    .then(doneSuccess)
                    .catch(doneError)
            }
        })
    }

    broadcast(chatIds, message, extra) {
        if (!Array.isArray(chatIds)) {
            throw new Error('chatIds must be an Array of chat/user ids')
        }

        let jobData = message

        if (typeof message === 'string') {
            jobData = {
                messageText: message,
                extra,
            }
        }

        if (jobData.messageId) {
            if (jobData.messageText) {
                throw new Error('Specify either messageId or messageText')
            }

            if (!jobData.fromChatId) {
                throw new Error('You must explicitly specify fromChatId')
            }
        }

        if (jobData.chatId) {
            throw new Error('Pass the chat id only in the chatIds array')
        }

        this.usersProcessed = 0
        this.usersAmount = chatIds.length

        chatIds.forEach(chatId => {
            this.queue.add({ chatId, ...jobData })
        })
    }

    reset() {
        const queue = this.queue

        return Promise.all([
            queue.empty(),
            queue.clean(0, 'delayed'),
            queue.clean(0, 'wait'),
            queue.clean(0, 'active'),
            queue.clean(0, 'completed'),
            queue.clean(0, 'failed'),
        ])
    }

    terminate() {
        const queue = this.queue

        return Promise.all([
            queue.empty(),
            queue.clean(0, 'wait'),
            queue.clean(0, 'active'),
        ])
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
        this.queue.on('drained', callback)
    }

    onProcessed(callback) {
        this.queue.on('completed', callback)
    }

    onFailed(callback) {
        this.queue.on('failed', callback)
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
