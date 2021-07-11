import {createApp} from 'vue'
import PDFContentTrans from '../PDFContentTrans.vue'
import {setUI, handleErr} from '@/components/appSetup';
import { ElDialog, ElInput } from 'element-plus';


const theApp = createApp(PDFContentTrans)
setUI(theApp, [ElDialog,ElInput])
handleErr(theApp)
theApp.mount('#pdf')
