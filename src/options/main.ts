import { createApp } from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'
import App from './views/App.vue'
import {setUI, handleErrAndWarn} from '@/components/appSetup'
import {eventToGoogle} from '@/utils/analytics'

import TransOptions from '@/options/views/TransOptions.vue'
import Collections from '@/options/views/Collections.vue'
import Settings from '@/options/views/Settings.vue'
import PageTrans from '@/options/views/PageTrans.vue'
import Other from '@/options/views/Other.vue'
import UIExample from '@/options/views/UIExample.vue'
import LLM from '@/options/views/LLM.vue'
import RuleLab from '@/options/views/RuleLab.vue'

const routes = [
    {
        path: '/settings',
        component: Settings,
        redirect: '/settings/trans',
        children: [
            {path: 'trans', component: TransOptions},
            {path: 'page-trans', component: PageTrans}
        ]
    },
    {path: '/', redirect: '/settings/trans'},
    {path: '/collections', component: Collections},
    {path: '/other', component: Other},
    {path: '/ui_example', component: UIExample},
    {path: '/llm', component: LLM},
    {path: '/rule-lab', component: RuleLab}
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