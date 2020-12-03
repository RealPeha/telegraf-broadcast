const Arena = require('bull-arena')
const Bull = require('bull')
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
