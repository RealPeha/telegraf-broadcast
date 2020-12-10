# Telegraf Broadcast
Send broadcast messages to all of your bot users for Telegraf.js based on [Bull Queue](https://github.com/OptimalBits/bull)

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
    broadcaster.sendText(userIds, 'Hello everyone')
})

bot.launch()
```
