import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup';

const theApp = createApp(app)
setUI(theApp)
handleErrAndWarn(theApp)

theApp.mount('#app')