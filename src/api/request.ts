
export interface IBaseResp {
    statusCode: number
    dataType: 'string' | 'obj'
    data?: any
    httpResp: Response
    err?: string
    res?:any
}

function appendParamsToURL(url: string, params: any) {
    if (!params) {
        return url
    }
    let updatedURL = url;

    const hasQueryParams = url.includes('?');
    //@ts-ignore
    const queryParams = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');

    updatedURL += hasQueryParams ? `&${queryParams}` : `?${queryParams}`;

    return updatedURL;
}

export async function baseRequest({
    url,
    method = 'GET',
    data = null,
    query = null,
    success = null,
    fail = null,
    headers = {},
    timeout = 30000,
}: {
    url: string
    method: string
    data?: any
    query?: any,
    success?: any
    fail?: any
    headers?: any
    timeout?: number
}) :Promise<IBaseResp> {

    const options = <any>{
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    }

    if (query) {
        url = appendParamsToURL(url, query)
    }

    if (method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
    }

    if (data) {
        options['body'] = JSON.stringify(data)
    }

    const request = fetch(url, options)
        .then(async (resp) => {
            const text = await resp.text()
            const res: IBaseResp = { statusCode: resp.status, data: text, dataType: 'string', httpResp: resp }
            try {
                res.data = JSON.parse(text)
                res.dataType = 'obj'
                return res
            } catch {
                return res
            }
        })
        .catch((err) => {
            return <IBaseResp>{ statusCode: err.status, httpResp: err, err: "__fetchErr__" }
        })


    let timeoutId: any
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(<IBaseResp>{statusCode: 800, err: '__timeout__'})
        }, timeout)
    })

    return await Promise.race([request, timeoutPromise])
        .then((resp) => {
            success && success(resp)
            return resp
        })
        .catch((resp) => {
            fail && fail(resp)
            return resp
        })
        .finally(() => {
            clearTimeout(timeoutId)
        }) as Promise<IBaseResp>
}
