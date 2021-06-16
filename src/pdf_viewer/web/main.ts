import {createApp} from 'vue'
import PDFContentTrans from '../PDFContentTrans.vue'
import {setUI} from '@/components/ElementUIImport';


const theApp = createApp(PDFContentTrans)
setUI(theApp)
theApp.mount('#pdf')
