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

interface FormatterFailedReason {
    code: number,
    status: string,
    message: string,
}

interface FormatterFailedJob<T> {
    data: T,
    failedReason?: FormatterFailedReason | string,
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

type ChatIds = number | string | number[] | string[] | ArrayLike

declare class Broadcaster {
    private usersProcessed: number
    private usersAmount: number
    private telegramApi: Telegraf<any> | Telegram
    private processor: ProcessCallbackFunction
    
    public queue: Queue<any>
    public options: BroadcasterOptions

    static queueName: string

    constructor(bot: Telegraf<any> | Telegram, options: BroadcasterOptions)

    private broadcast(chatIds: ChatIds, jobData: MessageText | MessageId): Broadcaster

    public get queueName(): string

    public sendText(chatIds: ChatIds, messageText: string, extra?: tt.ExtraEditMessage): Broadcaster
    public sendMessage(chatIds: ChatIds, fromChatId: number, messageId: number, extra?: tt.ExtraReplyMessage): Broadcaster
    public sendAudio(chatIds: ChatIds, audio: tt.InputFil, extra?: ExtraAudio): Broadcaster
    public sendChatAction(chatIds: ChatIds, action: tt.ChatAction): Broadcaster
    public sendDocument(chatIds: ChatIds, document: tt.InputFile, extra?: tt.ExtraDocument): Broadcaster
    public sendGame(chatIds: ChatIds, gameShortName: string, extra?: tt.ExtraGame): Broadcaster
    public sendLocation(chatIds: ChatIds, latitude: number, longitude: number, extra?: tt.ExtraLocation): Broadcaster
    public sendPhoto(chatIds: ChatIds, photo: tt.InputFile, extra?: tt.ExtraPhoto): Broadcaster
    public sendMediaGroup(chatIds: ChatIds, media: tt.MessageMedia[], extra?: tt.ExtraMediaGroup): Broadcaster
    public sendPoll(chatIds: ChatIds, question: string, options: string[], extra?: tt.ExtraPoll): Broadcaster
    public sendQuiz(chatIds: ChatIds, question: string, options: string[], extra?: tt.ExtraPoll): Broadcaster
    public sendAnimation(chatIds: ChatIds, animation: tt.InputFile, extra?: tt.ExtraAnimation): Broadcaster
    public sendSticker(chatIds: ChatIds, sticker: tt.InputFile, extra?: tt.ExtraSticker): Broadcaster
    public sendVideo(chatIds: ChatIds, video: tt.InputFile, extra?: tt.ExtraVideo): Broadcaster
    public sendVideoNote(chatIds: ChatIds, videoNote: tt.InputFileVideoNote, extra?: tt.ExtraVideoNote): Broadcaster
    public sendVoice(chatIds: ChatIds, voice: tt.InputFile, extra?: tt.ExtraVoice): Broadcaster
    public sendDice(chatIds: ChatIds, extra?: tt.ExtraDice): Broadcaster

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
