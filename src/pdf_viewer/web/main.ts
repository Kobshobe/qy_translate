import {createApp} from 'vue'
import PDFContentTrans from '../PDFContentTrans.vue'
import {setUI} from '@/components/ElementUIImport';
import { ElDialog, ElInput } from 'element-plus';


const theApp = createApp(PDFContentTrans)
setUI(theApp, [ElDialog,ElInput])
theApp.mount('#pdf')
