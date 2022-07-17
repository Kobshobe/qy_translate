import { createApp } from 'vue'
import app from './components/app.vue'
// import { ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip } from 'element-plus';
// import { setConfig } from 'element-plus/lib/utils/config.js'
import {eventToGoogle} from '@/utils/analytics'

// const components = [ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip];

export function setUI(app:any) {
    // const options = { zIndex: 2147483640, size: 'small' }
    // app.config.globalProperties.$ELEMENT = options
    // // setConfig(options)
    // components.push(...other)
    
    // components.forEach((component) => {
    //     app.component(component.name, component)
    // })
}

export function handleErrAndWarn(app:any) {
    app.config.errorHandler = (err:any, vm:any, info:any) => {
        // 处理错误
        // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
        const params:any = {}
        const errS = err.toString()
        const infoS = info.toString()
        if (errS.length > 100) {
            params.errS = errS.slice(0, 100)
        } else {
            params.err = errS
        }
        
        if (infoS.length > 100) {
            params.infoS = infoS.slice(0, 100)
        } else {
            params.info = infoS
        }

        eventToGoogle({
            name: 'handleErr100',
            params
        })
    }
    app.config.warnHandler = function(msg:any, vm:any, trace:any) {
        // `trace` 是组件的继承关系追踪
        const params:any = {}
        const msgS = msg.toString()
        const traceS = trace.toString()
        if (msgS.length > 100) {
            params.msg = msgS.slice(0, 100)
        } else {
            params.msgS = msgS
        }
        
        if (traceS.length > 100) {
            params.traceS = traceS.slice(0, 100)
        } else {
            params.trace = traceS
        }
        eventToGoogle({
            name: 'handleWarn100',
            params
        })
    }
}