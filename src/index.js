const Queue = require('bull')

const sendMessage = async (job, telegram, extra) => {
    const { id, message } = job.data

    try {
      await telegram.sendMessage(id, message, extra)
    } catch (err) {
        const { code } = err

        if (code === 403) {
            // blocked
        }

        if (!code || code === 429 || code >= 500) {
            throw err
        }
    }
}

const broadcastFactory = (telegram) => (userIds, message, extra) => {
    const queue = new Queue('messages')

    queue.process((job, done) => {
        return sendMessage(job, telegram, extra)
            .then(done)
            .catch(done)
    })

    userIds.forEach(id => queue.add({ id, message }))

    const pause = () => {
        queue.pause()
    }

    const resume = () => {
        queue.resume()
    }

    return {
        pause,
        resume,
    }
}

const broadcast = (telegram, userIds, message, extra = {}) => broadcastFactory(telegram)(userIds, message, extra)

const useBroadcast = () => (ctx, next) => {
    ctx.broadcast = (userIds, message, extra = {}) => broadcastFactory(ctx.telegram)(userIds, message, extra)

    return next(ctx)
}

module.exports = {
    broadcast,
    useBroadcast,
}
