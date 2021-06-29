import apiWrap from '../utils/apiWithPort'
import {openPDFReader,Install, bgInit} from '../utils/chromeApi'
import {eventToAnalytic, eventToGoogle} from "@/utils/analytics"

bgInit()

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
  // console.log('Conmmand', command)
})

chrome.runtime.onInstalled.addListener(() => {
  const pdfActionMenu:chrome.contextMenus.CreateProperties = {
    id: "actionPdfReader",
    title: "PDF阅读器",
    contexts: ["action", "browser_action"],
  }
  // const contextMenuItem:chrome.contextMenus.CreateProperties = {
  //   id: "page_pdf_reader",
  //   title: "PDF阅读器",
  // }
  chrome.contextMenus.create(pdfActionMenu)
  // chrome.contextMenus.create(contextMenuItem)
  const install = new Install()
  install.noFirstInstall()
})

chrome.runtime.setUninstallURL("https://www.wenjuan.com/s/UZBZJvIxG6A/", () => {
  eventToGoogle({
    name: "uninstall",
    params: {}
  })
})

// 右键菜单点击
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if(clickData.menuItemId === "actionPdfReader") {
    openPDFReader('actionMenu')
  }

})

