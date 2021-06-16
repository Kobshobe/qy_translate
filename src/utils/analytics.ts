import { IAnalyticEvent } from './interface'
import { googleAnalytic, clientVersion, client, Mode, os } from '@/config'
import { getClientId } from './chromeApi'


export async function eventToGoogle(event: IAnalyticEvent) {
    const id = await getClientId()
    Object.assign(event.params, {cv:clientVersion, c:client, st: navigator.userAgent, mode: Mode, os, uid: id})
    fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${googleAnalytic.measurementId}&api_secret=${googleAnalytic.apiSecret}`,
        {
            method: "POST",
            body: JSON.stringify({
                client_id: id,
                user_id: id,
                events: [
                    {
                        name: event.name,
                        params: event.params
                    },
                ],
            }),
        }
    );
}

export function eventToAnalytic({data}:{data:any}) {
    eventToGoogle(data)
}

// 文本截取超出加..
export function getTextLimit(text: string, length: number) {
    let t = text.slice(0, length)
    if(length < text.length) {
        t += ".."
    }
    return t
}