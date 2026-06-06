import { baseRequest, IBaseResp } from "./request"
import {Context} from './context'
import { baseURL } from "@/config"

export async function srvApiRequest({
    c,
    path,
    method = 'GET',
    headers = {},
    timeout = 30000,
}: {
    c:Context,
    path: string
    method: string
    headers?: any
    timeout?: number
}) :Promise<IBaseResp> {

    headers["device"] = "device"
    headers["device_id"] = "device_id"
    headers["Accept-Language"] = "zh-CN"

    const url = `${baseURL}${path}`
    let query;
    let data;
    if (method == "GET" || method == 'get') {
        query = c.req
    } else {
        data = c.req
    }

    const resp = await baseRequest({
        url,
        method,
        data,
        query,
        headers,
        timeout,
    })
    if (resp.err) {
        c.err = resp.err
    } else {
        if (resp.data?.msg) {
            c.err = resp.data.msg
            if (resp.data?.detail) {
                c.errDetail = resp.data.detail
            }
        }
        if (resp.data?.data)  {
            c.res = resp.data.data
        }
    }
    c.resp = resp
    return resp
}