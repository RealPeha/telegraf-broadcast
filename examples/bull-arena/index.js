
const Bull = require('bull')
const Arena = require('bull-arena')
const Broadcaster = require('telegraf-broadcast')
 
Arena({
  Bull,
  queues: [
    {
      name: Broadcaster.queueName,
      hostId: 'telegram',
    },
  ],
})
