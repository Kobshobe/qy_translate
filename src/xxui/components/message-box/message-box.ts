import { createApp, watch } from 'vue'
import MessageBoxComponent from './MessageBox.vue'

const fields = ['confirm', 'prompt', 'alert']

const MessageBox:any = (msg:string, options:any) => {
    options.msg = msg
    const messageBoxApp = createApp(MessageBoxComponent, options)

    return new Promise((resolve, reject) => {
        showMessageBox(messageBoxApp, {resolve, reject})
    })
}

fields.forEach((field:any) => {
    MessageBox[field] = (msg:string, options:any) => {
        options.field = field;
        return MessageBox(msg, options)
    }
})

function showMessageBox(app:any, {resolve, reject}:any) :any {
    const fragment = document.createDocumentFragment()
    const vm = app.mount(fragment);
    document.body.appendChild(fragment)
    vm.setVisible(true)
    watch(()=>vm.state.visible, (val:any) => {
        if (!val) {
            // if (vm.state.type === 'confirm') {
            //     resolve && resolve();
            // } else if (vm.state.type === 'cancel') {
            //     reject && reject();
            // }
            app.unmount()
        }
    })
}

export default MessageBox