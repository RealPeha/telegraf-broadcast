# Telegraf Broadcast
Simple library for broadcast message to all users for telegraf.js using [bull](https://github.com/OptimalBits/bull) queue

## Installation
Just use npm

    npm i telegraf-broadcast --save
    
or yarn

    yarn add telegraf-broadcast
    
## Example of use as function

```javascript
const Telegraf = require('telegraf')
const { broadcast } = require('telegraf-broadcast')

const bot = new Telegraf(process.env.BOT_TOKEN)

const userIds = [154674234, 154674235, 154674236, 154674237, 154674239];

bot.start((ctx) => {
    return broadcast(ctx.telegram, userIds, 'Hello everyone')
})

bot.launch()
```

## Example of use as middleware

```javascript
const Telegraf = require('telegraf')
const { useBroadcast } = require('telegraf-broadcast')

const bot = new Telegraf(process.env.BOT_TOKEN)

const userIds = [154674234, 154674235, 154674236, 154674237, 154674239];

bot.use(useBroadcast())

bot.start((ctx) => {
    return ctx.broadcast(userIds, 'Hello everyone')
})

bot.launch()
```
