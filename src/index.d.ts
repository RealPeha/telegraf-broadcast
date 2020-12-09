import { Job, EventCallback, CompletedEventCallback, FailedEventCallback, Queue, QueueOptions, JobOptions, ProcessCallbackFunction } from 'bull'
import * as tt from 'telegraf/typings/telegram-types'
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

interface BroadcasterOptions {
    processes?: number,
    bullJobOptions?: JobOptions,
    bullQueueOptions?: QueueOptions,
    queueName?: string,
}

declare class Broadcaster {
    private usersProcessed: number
    private usersAmount: number
    private telegramApi: Telegraf<any> | Telegram
    private processor: ProcessCallbackFunction
    
    public queue: Queue<any>
    public options: BroadcasterOptions

    static queueName: string

    constructor(bot: Telegraf<any> | Telegram, options: BroadcasterOptions)

    private broadcast(chatIds: number[], jobData: MessageText | MessageId): Broadcaster

    public sendText(chatIds: number[], messageText: string, extra?: tt.ExtraEditMessage): Broadcaster
    public sendMessage(chatIds: number[], fromChatId: number, messageId: number, extra?: tt.ExtraReplyMessage): Broadcaster
    public sendAudio(chatIds: number[], audio: tt.InputFil, extra?: ExtraAudio): Broadcaster
    public sendChatAction(chatIds: number[], action: tt.ChatAction): Broadcaster
    public sendDocument(chatIds: number[], document: tt.InputFile, extra?: tt.ExtraDocument): Broadcaster
    public sendGame(chatIds: number[], gameShortName: string, extra?: tt.ExtraGame): Broadcaster
    public sendLocation(chatIds: number[], latitude: number, longitude: number, extra?: tt.ExtraLocation): Broadcaster
    public sendPhoto(chatIds: number[], photo: tt.InputFile, extra?: tt.ExtraPhoto): Broadcaster
    public sendMediaGroup(chatIds: number[], media: tt.MessageMedia[], extra?: tt.ExtraMediaGroup): Broadcaster
    public sendPoll(chatIds: number[], question: string, options: string[], extra?: tt.ExtraPoll): Broadcaster
    public sendQuiz(chatIds: number[], question: string, options: string[], extra?: tt.ExtraPoll): Broadcaster
    public sendAnimation(chatIds: number[], animation: tt.InputFile, extra?: tt.ExtraAnimation): Broadcaster
    public sendSticker(chatIds: number[], sticker: tt.InputFile, extra?: tt.ExtraSticker): Broadcaster
    public sendVideo(chatIds: number[], video: tt.InputFile, extra?: tt.ExtraVideo): Broadcaster
    public sendVideoNote(chatIds: number[], videoNote: tt.InputFileVideoNote, extra?: tt.ExtraVideoNote): Broadcaster
    public sendVoice(chatIds: number[], voice: tt.InputFile, extra?: tt.ExtraVoice): Broadcaster
    public sendDice(chatIds: number[], extra?: tt.ExtraDice): Broadcaster

    public reset(): Promise<[void, Job<any>[], Job<any>[], Job<any>[], Job<any>[], Job<any>[]]>
    
    public terminate(): Promise<[void, Job<any>[], Job<any>[]]>
    
    public pause(): Promise<void>

    public resume(): Promise<void>

    public progress(): number

    public onCompleted(callback: EventCallback): Queue<any>

    public onProcessed(callback: CompletedEventCallback): Queue<any>

    public onFailed(callback: FailedEventCallback): Queue<any>

    public failed(formatJob?: boolean): Promise<Job<any>> | Promise<FormatterFailedJob<any>>

    public status(): Promise<BroadcasterStatus>

    static formatFailedJob(job: Job<any>): FormatterFailedJob<any>
}
