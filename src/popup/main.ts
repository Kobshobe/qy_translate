import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI, handleErr} from '@/components/appSetup';

const theApp = createApp(app)
setUI(theApp)
handleErr(theApp)


theApp.mount('#app')