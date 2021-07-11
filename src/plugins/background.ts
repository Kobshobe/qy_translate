import {apiWrap} from '../utils/apiWithPort'
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

// mark i18n
chrome.runtime.onInstalled.addListener(() => {
  const install = new Install()
  install.noFirstInstall()
  const pdfActionMenu:chrome.contextMenus.CreateProperties = {
    id: "actionPdfReader",
    title: "PDF阅读器",
    contexts: ["action", "browser_action"],
  }
  // mark i18n
  const transMenuItem:chrome.contextMenus.CreateProperties = {
    id: "trans",
    title: "翻译",
    contexts: ['selection']
  }
  chrome.contextMenus.create(pdfActionMenu)
  chrome.storage.sync.get(['menuTrans'], (res) => {
    if(res.menuTrans === false) return
    chrome.contextMenus.create(transMenuItem)
  })
  
})

chrome.runtime.setUninstallURL("https://www.fishfit.fun:8080/p/web/uninstall", () => {})

// 菜单点击
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if(clickData.menuItemId === "actionPdfReader") {
    openPDFReader('actionMenu')
  } if(clickData.menuItemId === 'trans') {
    console.log('trans: ', clickData)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      chrome.tabs.sendMessage(tabs[0].id, {text: clickData.selectionText});
    });
  }

})

