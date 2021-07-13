import {createApp} from 'vue'
import PDFContentTrans from '../PDFContentTrans.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup';
import { ElDialog, ElInput } from 'element-plus';


const theApp = createApp(PDFContentTrans)
setUI(theApp, [ElDialog,ElInput])
handleErrAndWarn(theApp)
theApp.mount('#pdf')
