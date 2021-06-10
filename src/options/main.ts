import { createApp } from 'vue'
import app from './components/app.vue'
import { ElButton, ElSelect, ElOption } from 'element-plus';
import { setConfig } from 'element-plus/lib/utils/config.js'

// (function () {
//     const ga = document.createElement("script");
//     ga.type = "text/javascript";
//     ga.async = true;
//     ga.src = "https://ssl.google-analytics.com/ga.js";
//     const s = document.getElementsByTagName("script")[0];
//     s.parentNode?.insertBefore(ga, s);
//   })();

const components = [ElButton, ElSelect, ElOption]

const theApp = createApp(app)
const options = { zIndex: 3000, size: 'small' }
theApp.config.globalProperties.$ELEMENT = options
setConfig(options)

components.forEach((component) => {
    theApp.component(component.name, component)
})

theApp.mount('#options')