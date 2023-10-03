import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'
import App from './views/App.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup'
import {eventToGoogle} from '@/utils/analytics'

import TransOptions from '@/options/views/TransOptions.vue'
import Collections from '@/options/views/Collections.vue'
import Other from '@/options/views/Other.vue'
import UIExample from '@/options/views/UIExample.vue'

const routes = [
    {path: '/', component: TransOptions},
    {path: '/collections', component: Collections},
    {path: '/other', component: Other},
    {path: '/ui_example', component: UIExample}
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

const theApp = createApp(App)
setUI(theApp)
theApp.use(router)
handleErrAndWarn(theApp)

theApp.mount('#options')