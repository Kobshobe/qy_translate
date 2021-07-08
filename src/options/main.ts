import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI} from '@/components/ElementUIImport'
import { ElDialog } from 'element-plus';

const theApp = createApp(app)
setUI(theApp, [ElDialog])

theApp.mount('#options')