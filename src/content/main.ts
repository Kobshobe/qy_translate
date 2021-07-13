import { createApp } from 'vue'
import app from './components/app.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup';

function joinContent() {
  const id = 'phraseJoinewrskdfdswerhnyikyofd'
  const div = document.createElement('div')
  div.id = id
  document.body?.appendChild(div)

  const theApp = createApp(app)
  handleErrAndWarn(theApp)
  setUI(theApp)
  theApp.mount('#' + id)
}

joinContent()
