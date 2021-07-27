import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'
import app from './components/app.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup'
import { ElDialog, ElRadio, ElIcon, ElCheckbox, ElDropdown, ElDropdownMenu, ElDropdownItem, ElInput, ElEmpty } from 'element-plus';
import {eventToGoogle} from '@/utils/analytics'

import TransOptions from '@/options/components/TransOptions.vue'
import Collections from '@/options/components/Collections.vue'
import Other from '@/options/components/Other.vue'

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
setUI(theApp, [ElDialog, ElRadio, ElIcon, ElCheckbox, ElDropdown, ElDropdownMenu, ElDropdownItem, ElInput, ElEmpty])
theApp.use(router)
handleErrAndWarn(theApp)

theApp.mount('#options')