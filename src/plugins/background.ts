import apiWrap from '../utils/apiWithPort'
import {init, openPDFReader} from '../utils/chromeApi'
import {eventToAnalytic, eventToGoogle} from "@/utils/analytics"

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
chrome.commands.onCommand.addListener(function (command: any) {
  console.log('Conmmand', command)
})

chrome.runtime.onInstalled.addListener(() => {
  const contextMenuItem:chrome.contextMenus.CreateProperties = {
    id: "open_pdf_reader",
    title: "PDF阅读器",
    contexts: ["action"],
  }
  chrome.contextMenus.create(contextMenuItem)

})

// 右键菜单点击
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if(clickData.menuItemId === "open_pdf_reader") {
    openPDFReader("menu")
  }

})

