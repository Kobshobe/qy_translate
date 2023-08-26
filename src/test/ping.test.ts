import {Context} from '@/api/context'
import {ping} from '@/api/api'

jest.setTimeout(20000)

test("ping api status_data test", async () => {
    expect(true).toBe(true)
    const c = await ping(new Context({scene: 'status_data'}))
    expect(c.res.msg).toBe('pong') 
    expect(c.err).toBe(undefined)
})

test("ping api err_resp test", async () => {
    expect(true).toBe(true)
    const c = await ping(new Context({scene: 'err'}))
    expect(c.resp.data.code).toBe(2)
    expect(c.err).toBe(c.resp.data.msg)
})

test("ping api sleep_timeout test", async () => {
    expect(true).toBe(true)
    const c = await ping(new Context({scene: 'sleep'}))
    expect(c.err).toBe('__timeout__')
})