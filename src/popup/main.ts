import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI} from '@/components/ElementUIImport';

const theApp = createApp(app)
setUI(theApp)


theApp.mount('#app')