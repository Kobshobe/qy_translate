import apiWrap from '../utils/apiWithPort'
import {init} from '../utils/chromeApi'

init()

chrome.runtime.onConnect.addListener(function (port:chrome.runtime.Port) {

  port.onMessage.addListener(async function (msg: any) {
    // @ts-ignore
    apiWrap[port.name](msg, port)

  })
})

// chrome.action.setBadgeText({text: '2'})
// chrome.action.getPopup({})
// chrome.action.setTitle('4')


// 快捷键
// chrome.commands.onCommand.addListener(function (command: any) {
//   console.log('Conmmand', command)
// })

// const contextMenuItem:chrome.contextMenus.CreateProperties = {
//   id: "phrase_open_pdf",
//   title: "打开pdf",
//   contexts: ["action"],
// }

// chrome.runtime.onInstalled.addListener(function () {
//   // console.log("on install")
//   chrome.contextMenus.create(contextMenuItem)

// })

// // 右键菜单点击
// chrome.contextMenus.onClicked.addListener(function (clickData: any) {
//   console.log("contextMenus click", clickData)
//   const url = chrome.runtime.getURL("pdf_view.html")
//   console.log(url)
//   chrome.tabs.create({url})
//   // chrome.runtime.sendMessage({ todo: "testSend" })
// })

