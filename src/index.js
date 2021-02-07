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

const apiMethodArguments = {
    copyMessage: ({ fromChatId, messageId, extra }) => [
        fromChatId,
        messageId,
        extra,
    ],
    sendMessage: ({ messageText, extra }) => [messageText, extra],
    sendAudio: ({ audio, extra }) => [audio, extra],
    sendChatAction: ({ action }) => [action],
    sendDocument: ({ document, extra }) => [document, extra],
    sendGame: ({ gameShortName, extra }) => [gameShortName, extra],
    sendLocation: ({ latitude, longitude, extra }) => [latitude, longitude, extra],
    sendPhoto: ({ photo, extra }) => [photo, extra],
    sendMediaGroup: ({ media, extra }) => [media, extra],
    sendPoll: ({ question, options, extra }) => [question, options, extra],
    sendQuiz: ({ question, options, extra }) => [question, options, extra],
    sendAnimation: ({ animation, extra }) => [animation, extra],
    sendSticker: ({ sticker, extra }) => [sticker, extra],
    sendVideo: ({ video, extra }) => [video, extra],
    sendVideoNote: ({ videoNote, extra }) => [videoNote, extra],
    sendVoice: ({ voice, extra }) => [voice, extra],
    sendDice: ({ extra }) => [extra],
}

const getApiMethodArguments = (apiMethod, jobData) => {
    if (!apiMethodArguments[apiMethod]) {
        throw new Error(`apiMethod ${apiMethod} not found`)
    }

    return apiMethodArguments[apiMethod](jobData)
}

const isArrayLike = (item) => {
    return (
        Array.isArray(item) || 
        (
            !!item &&
            typeof item === 'object' &&
            'forEach' in item &&
            typeof item.forEach === 'function' &&
            ('length' in item || 'size' in item)
        )
    )
}

class Broadcaster {
    static queueName = 'tg-broadcast'

    constructor(bot, options) {
        this.telegramApi = getTelegramApi(bot)
        this.options = {
            processes: 1,
            queueName: Broadcaster.queueName,
            bullJobOptions: {},
            bullQueueOptions: {},
            ...options,
        }

        this.usersProcessed = 0
        this.usersAmount = 0

        this.queue = new Queue(this.queueName, this.options.bullQueueOptions)
        this.queue.process(this.options.processes, this.processor)
    }

    get queueName() {
        return this.options.queueName
    }

    processor = (job, done) => {
        const { apiMethod, chatId } = job.data
    
        const doneSuccess = (res) => {
            this.usersProcessed += 1
            done(null, res)
        }
    
        const doneError = (err) => {
            this.usersProcessed += 1
            done(err)
        }

        const callApiArguments = getApiMethodArguments(apiMethod, job.data)
    
        if (apiMethod === 'copyMessage') {
            const [fromChatId, messageId, extra] = callApiArguments

            this.telegramApi.callApi(apiMethod, {
                chat_id: chatId,
                from_chat_id: fromChatId,
                message_id: messageId,
                ...extra,
            })
                .then(doneSuccess)
                .catch(doneError)
        } else {
            this.telegramApi[apiMethod](chatId, ...callApiArguments)
                .then(doneSuccess)
                .catch(doneError)
        }
    }

    broadcast(chatIds, jobData) {
        if (typeof chatIds === 'number' || typeof chatIds === 'string') {
            chatIds = [chatIds]
        }

        if (!isArrayLike(chatIds)) {
            throw new Error('chatIds must be an Array or Array-like of chat/user/channel ids')
        }

        this.usersProcessed = 0
        this.usersAmount = chatIds.length || chatIds.size || 0

        chatIds.forEach(chatId => {
            this.queue.add({ chatId, ...jobData }, this.options.bullJobOptions)
        })

        return this
    }

    sendMessage(chatIds, fromChatId, messageId, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'copyMessage',
            fromChatId,
            messageId,
            extra,
        })
    }

    sendText(chatIds, messageText, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendMessage',
            messageText,
            extra,
        })
    }

    sendAudio(chatIds, audio, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendAudio',
            audio,
            extra,
        })
    }

    sendChatAction(chatIds, action) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendChatAction',
            action
        })
    }

    sendDocument(chatIds, document, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendDocument',
            document,
            extra,
        })
    }

    sendGame(chatIds, gameShortName, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendGame',
            gameShortName,
            extra,
        })
    }

    sendLocation(chatIds, latitude, longitude, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendLocation',
            latitude,
            longitude,
            extra,
        })
    }

    sendPhoto(chatIds, photo, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendPhoto',
            photo,
            extra,
        })
    }

    sendMediaGroup(chatIds, media, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendMediaGroup',
            media,
            extra,
        })
    }
    
    sendPoll(chatIds, question, options, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendPoll',
            question,
            options,
            extra,
        })
    }

    sendQuiz(chatIds, question, options, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendQuiz',
            question,
            options,
            extra,
        })
    }

    sendAnimation(chatIds, animation, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendAnimation',
            animation,
            extra,
        })
    }

    sendSticker(chatIds, sticker, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendSticker',
            sticker,
            extra,
        })
    }

    sendVideo(chatIds, video, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendVideo',
            video,
            extra,
        })
    }

    sendVideoNote(chatIds, videoNote, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendVideoNote',
            videoNote,
            extra,
        })
    }

    sendVoice(chatIds, voice, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendVoice',
            voice,
            extra,
        })
    }

    sendDice(chatIds, extra) {
        return this.broadcast(chatIds, {
            apiMethod: 'sendDice',
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

        const [failedCount, completedCount, activeCount, delayedCount, waitingCount] = await Promise.all([
            queue.getFailedCount(),
            queue.getCompletedCount(),
            queue.getActiveCount(),
            queue.getDelayedCount(),
            queue.getWaitingCount(),
        ])

        return { failedCount, completedCount, activeCount, delayedCount, waitingCount }
    }

    middleware() {
        return Telegraf.tap(ctx => {
            ctx.broadcaster = this
        })
    }

    static formatFailedJob(job) {
        const { failedReason, data } = job

        if (!failedReason) {
            return { data }
        }

        const [code, status, message] = failedReason
            .split(':')
            .map(str => str.trim())

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
