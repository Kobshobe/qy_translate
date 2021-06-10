import { IEvent } from './interface'
import { googleAnalytic, clientVersion, client, Mode, os } from '@/config'
import { getClientId } from './chromeApi'


export async function eventToGoogle(event: IEvent) {
    const id = await getClientId()
    Object.assign(event.params, {cv:clientVersion, c:client, st: navigator.userAgent, mode: Mode, os})
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