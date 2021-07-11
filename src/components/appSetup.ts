import { createApp } from 'vue'
import app from './components/app.vue'
import { ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip } from 'element-plus';
import { setConfig } from 'element-plus/lib/utils/config.js'
import {eventToAnalytics} from '@/utils/chromeApi'

const components = [ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip];

export function setUI(app:any, other:any[]=[]) {
    const options = { zIndex: 2147483640, size: 'small' }
    app.config.globalProperties.$ELEMENT = options
    setConfig(options)
    components.push(...other)
    
    components.forEach((component) => {
        app.component(component.name, component)
    })
}

export function handleErr(app:any) {
    app.config.errorHandler = (err:any, vm:any, info:any) => {
        // 处理错误
        // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
        const params:any = {}
        const errS = err.toString()
        const infoS = info.toString()
        if (errS.length > 40) {
            params.errS = errS.slice(0, 40)
        } else {
            params.err = errS
        }
        
        if (infoS.length > 40) {
            params.infoS = infoS.slice(0, 40)
        } else {
            params.info = infoS
        }

        eventToAnalytics({
            name: 'handleErr',
            params
        })
    }
    app.config.warnHandler = function(msg:any, vm:any, trace:any) {
        // `trace` 是组件的继承关系追踪
        const params:any = {}
        const msgS = msg.toString()
        const traceS = trace.toString()
        if (msgS.length > 40) {
            params.msg = msgS.slice(0, 40)
        } else {
            params.msgS = msgS
        }
        
        if (traceS.length > 40) {
            params.traceS = traceS.slice(0, 40)
        } else {
            params.trace = traceS
        }
        eventToAnalytics({
            name: 'handleWarn',
            params
        })
    }
}