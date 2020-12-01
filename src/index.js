const Queue = require('bull')

class Broadcaster {
    constructor(bot, bullQueueOptions) {
        this.queue = new Queue('broadcast', bullQueueOptions)
        this.queue.process((job, done) => {
            const { chatId, fromChatId, messageId, messageText, extra } = job.data

            if (messageId) {
                return bot.telegram.callApi('copyMessage', {
                    chat_id: chatId,
                    from_chat_id: fromChatId || chatId,
                    message_id: messageId,
                    ...extra,
                })
                    .then(() => done())
                    .catch(done)
            }

            return bot.telegram.sendMessage(chatId, messageText, extra)
                .then(() => done())
                .catch(done)
        })
    }

    broadcast(chatIds, message, extra) {
        let jobData = message

        if (typeof message === 'string') {
            jobData = {
                messageText: message,
                extra,
            }
        } else if (typeof message === 'number') {
            jobData = {
                messageId: message,
                extra,
            }
        }

        chatIds.forEach(chatId => this.queue.add({ chatId, ...jobData }))
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

    failed() {
        return this.queue.getFailed()
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
}

module.exports = Broadcaster
