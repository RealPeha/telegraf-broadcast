const bot = require('./bot')
const Broadcaster = require('../../src')

const broadcaster = new Broadcaster(bot)

const userIds = [155054210, 155054211, 155054212, 155054213]

broadcaster.broadcast(userIds, '<b>Hello everyone</b>', { parse_mode: 'HTML' })
