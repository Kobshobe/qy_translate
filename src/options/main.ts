import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'
import app from './components/app.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup'
import {eventToGoogle} from '@/utils/analytics'

import TransOptions from '@/options/components/TransOptions.vue'
import Collections from '@/options/components/Collections.vue'
import Other from '@/options/components/Other.vue'

import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

const routes = [
    {path: '/', component: TransOptions},
    {path: '/collections', component: Collections},
    {path: '/other', component: Other}
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.afterEach((to, from) => {
    eventToGoogle({
        name: `opRouter`,
        params: {
            fromAndTo: `${from.fullPath} => ${to.fullPath}`
        }
    })
})

const theApp = createApp(app)
setUI(theApp)
theApp.use(router)
handleErrAndWarn(theApp)

theApp.mount('#options')