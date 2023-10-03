import { createApp, ref, watch } from "vue"
import types from "./types"
import MessageComponent from './Message.vue'
import { findIndex } from "../../shared/utils"

const messageArr = ref(<any[]>[])

const Message:any = (options:any) => {
    if (typeof options === 'string') {
        options = {message: options}
    }
    const messageApp = createApp(MessageComponent, options)
    showMessage(messageApp, options.duration)
}

Object.values(types).forEach(type => {
    Message[type] = (options:any) => {
        options.type = type
        return Message(options)
    }
})

function showMessage(app:any, duration:number) {
    const fragment = document.createDocumentFragment()
    const vm = app.mount(fragment) 
    messageArr.value.push(vm)
    document.body.appendChild(fragment)

    setTop(vm)
    vm.setVisible(true)
    watch(messageArr, () => setTop(vm))
    hideMessage(app, vm, duration)
}

function hideMessage(app:any, vm:any, duration:number) {
    vm.timer = setTimeout(async () => {
        const msg = await vm.setVisible(false)
        app.unmount()
        messageArr.value = messageArr.value.filter(item => item !== vm)
        clearTimeout(vm.timer)
        vm.timer = null
    }, duration || 2500)
}

function setTop(vm:any) {
    const {setTop, height, margin} = vm
    const currentIndex = findIndex(messageArr.value, vm)
    setTop(margin * (currentIndex+1) + height * currentIndex)
}

export default Message