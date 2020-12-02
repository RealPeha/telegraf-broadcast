import { Job, EventCallback, Queue, QueueOptions } from 'bull'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { Telegraf, Telegram } from 'telegraf/typings/index'

export = Broadcaster

interface MessageId {
    messageId: number,
    fromChatId: number,
    extra?: ExtraReplyMessage,
}

interface MessageText {
    messageText: string,
    extra?: ExtraReplyMessage,
}

interface FormatterFailedJob<T> {
    data: T,
    failedReason?: {
        code: number,
        status: string,
        message: string,
    }
}

interface BroadcasterStatus {
    failedCount: number,
    completedCount: number,
    activeCount: number,
    delayedCount: number,
    waitingCount: number,
}

declare class Broadcaster {
    private usersProcessed: number
    private usersAmount: number

    public queue: Queue<any>

    constructor(bot: Telegraf<any> | Telegram, bullQueueOptions?: QueueOptions)

    broadcast(chatIds: number[], message: string | MessageId | MessageText, extra?: ExtraReplyMessage): void

    reset(): Promise<[void, Job<any>[], Job<any>[], Job<any>[], Job<any>[], Job<any>[]]>
    
    terminate(): Promise<[void, Job<any>[], Job<any>[]]>
    
    pause(): Promise<void>

    resume(): Promise<void>

    progress(): number

    onCompleted(callback: EventCallback): Queue<any>

    failed(formatJob?: boolean): Job<any> | FormatterFailedJob<any>

    status(): BroadcasterStatus

    static formatFailedJob(job: Job<any>): FormatterFailedJob<any>
}
