# Telegraf Message Broadcast
Send broadcast messages to all of your bot users/groups/channels for [Telegraf.js](https://github.com/telegraf/telegraf/) based on [Bull Queue](https://github.com/OptimalBits/bull)

## Installation
Just use npm

    npm i telegraf-broadcast --save
    
or yarn

    yarn add telegraf-broadcast

## Usage
If you want to make message broadcast in your bot you must have a user database to get their telegram ids.

For example

```js
const users = await SomeDB.getAllMyBotUsers()

console.log(users)
/*
    [
        ...
        {
            id: 1234,
            username: 'RealPeha'
            ...
        }
        ...
    ]
*/

const userIds = users.map(user => user.id)

console.log(userIds)
/*
    [..., 1234, ...]
*/

broadcaster.sendText(userIds, '42')
```

## Examples

### Send plain text

```javascript
const { Telegraf } = require('telegraf')
const Broadcaster = require('telegraf-broadcast')

const bot = new Telegraf(process.env.BOT_TOKEN)
const broadcaster = new Broadcaster(bot)

const userIds = [154674234, 154674235, 154674236, 154674237, 154674239]

bot.start((ctx) => {
    broadcaster.sendText(userIds, 'Hello everyone')
})

bot.launch()
```

### Send copy of the message

```javascript
const userIds = [154674234, 154674235, 154674236, 154674237, 154674239]

bot.command('/broadcast', ctx => {
    const replyMessage = ctx.message.reply_to_message

    if (replyMessage) {
        broadcaster.sendMessage(userIds, ctx.chat.id, replyMessage.message_id)
    }
})
```

### Inject broadcaster to the context
```javascript
const broadcaster = new Broadcaster(bot)

bot.use(broadcaster)

// in another file, for example
bot.start((ctx) => {
    ctx.broadcaster.sendText([154674234], 'Hello everyone')
})
```
