import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup'
import { ElDialog, ElRadio } from 'element-plus';

const theApp = createApp(app)
setUI(theApp, [ElDialog, ElRadio])
handleErrAndWarn(theApp)

theApp.mount('#options')