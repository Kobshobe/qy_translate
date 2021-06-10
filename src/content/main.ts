import { createApp } from 'vue'
import app from './components/app.vue'
import { ElButton, ElSelect, ElOption } from 'element-plus';
import { setConfig } from 'element-plus/lib/utils/config.js'

function joinContent() {
  const id = 'phraseJoinewrskdfdswerhnyikyofd'
  const div = document.createElement('div')
  div.id = id
  document.body?.appendChild(div)

  const components = [ElButton, ElSelect, ElOption]
  const theApp = createApp(app)
  const options = { zIndex: 31474836, size: 'small' }
  theApp.config.globalProperties.$ELEMENT = options
  setConfig(options)
  components.forEach((component) => {
    theApp.component(component.name, component)
  })
  theApp.mount('#' + id)
}

joinContent()
// injectJsInsert()



// function injectJsInsert () {
//   document.addEventListener('readystatechange', () => {
//     const injectPath = 'js/inject.js'
//     let url = chrome.runtime.getURL(injectPath);
//     const script = document.createElement('script')

//     script.setAttribute('type', 'text/javascript')
//     script.src = url
//     document.body.appendChild(script)
//   })
// }
