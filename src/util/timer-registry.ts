export interface Timeout {
    callback: Function,
    duration: number,
    context: any,
    data?: object
}

export class TimerRegistry {

    public add (timeout: Timeout): number {
        return setTimeout(
            timeout.callback.bind(timeout.context, timeout.data),
            timeout.duration
        )
    }

    public remove (timerId: number): boolean {
        clearTimeout(timerId)
        return true
    }
}
