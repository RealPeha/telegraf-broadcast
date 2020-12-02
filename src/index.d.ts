import { Job, EventCallback, CompletedEventCallback, FailedEventCallback, Queue, QueueOptions } from 'bull'
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

    private run(chatIds: number[], jobData: MessageText | MessageId): Broadcaster

    public sendText(chatIds: number[], messageText: string, extra?: ExtraReplyMessage): Broadcaster
    public sendMessage(chatIds: number[], fromChatId: number, messageId: number, extra?: ExtraReplyMessage): Broadcaster

    public reset(): Promise<[void, Job<any>[], Job<any>[], Job<any>[], Job<any>[], Job<any>[]]>
    
    public terminate(): Promise<[void, Job<any>[], Job<any>[]]>
    
    public pause(): Promise<void>

    public resume(): Promise<void>

    public progress(): number

    public onCompleted(callback: EventCallback): Queue<any>

    public onProcessed(callback: CompletedEventCallback): Queue<any>

    public onFailed(callback: FailedEventCallback): Queue<any>

    public failed(formatJob?: boolean): Job<any> | Promise<FormatterFailedJob<any>>

    public status(): Promise<BroadcasterStatus>

    static formatFailedJob(job: Job<any>): FormatterFailedJob<any>
}
