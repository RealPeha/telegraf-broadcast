# Telegraf Broadcast
Simple library for broadcast message to all bot users for telegraf.js using [bull](https://github.com/OptimalBits/bull) queue

## Installation
Just use npm

    npm i telegraf-broadcast --save
    
or yarn

    yarn add telegraf-broadcast
    
## Example of use

```javascript
const Telegraf = require('telegraf')
const Broadcaster = require('telegraf-broadcast')

const bot = new Telegraf(process.env.BOT_TOKEN)
const broadcaster = new Broadcaster(bot)

const userIds = [154674234, 154674235, 154674236, 154674237, 154674239];

bot.start((ctx) => {
    broadcaster.sendMessage(userIds, 'Hello everyone')
})

bot.launch()
```
