import { createApp } from 'vue'
import app from './components/app.vue'
import { ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip } from 'element-plus';
import { setConfig } from 'element-plus/lib/utils/config.js'

const components = [ElButton, ElSelect, ElOptionGroup, ElOption, ElSwitch, ElTooltip];

export function setUI(app:any, other:any[]=[]) {
    const options = { zIndex: 31474836, size: 'small' }
    app.config.globalProperties.$ELEMENT = options
    setConfig(options)
    components.push(...other)
    
    components.forEach((component) => {
        app.component(component.name, component)
    })
}
