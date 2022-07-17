import {createApp} from 'vue'
import PDFContentTrans from '../PDFContentTrans.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup';


const theApp = createApp(PDFContentTrans)
setUI(theApp)
handleErrAndWarn(theApp)
theApp.mount('#pdf')
