import {apiWrap} from '../utils/apiWithPort'
import {openPDFReader,onInstall, bgInit} from '../utils/chromeApi'
import {eventToAnalytic, eventToGoogle} from "@/utils/analytics"
// import {setLang} from '@/utils/chromeApi'

// bgInit()

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

// _mark i18n
chrome.runtime.onInstalled.addListener((details) => {
  let transMsg:string;
  let openPDFMsg:string;
  const lang = navigator.language
  if (lang === 'zh-CN' || lang === 'zh') {
    transMsg = '翻译';
    openPDFMsg = 'PDF阅读器';
  } else if (lang === 'zh-TW' || lang === 'zh-HK') {
    transMsg = '翻譯'
    openPDFMsg = 'PDF閱讀器';
  } else {
    transMsg = 'translate'
    openPDFMsg = 'Open PDF Reader'
    //@ts-ignore
  }

  const pdfActionMenu:chrome.contextMenus.CreateProperties = {
    id: "actionPdfReader",
    title: openPDFMsg,
    contexts: ["action", "browser_action"],
  }
  // _mark i18n
  const transMenuItem:chrome.contextMenus.CreateProperties = {
    id: "trans",
    title: transMsg,
    contexts: ['selection']
  }
  chrome.contextMenus.create(pdfActionMenu)
  chrome.storage.sync.get(['menuTrans'], (res) => {
    if(res.menuTrans === false) return
    chrome.contextMenus.create(transMenuItem)
  })

  onInstall(details)
  
})

chrome.runtime.setUninstallURL("https://www.fishfit.fun:8080/p/web/uninstall", () => {})

// 菜单点击
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if(clickData.menuItemId === "actionPdfReader") {
    openPDFReader('actionMenu')
  } if(clickData.menuItemId === 'trans') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      chrome.tabs.sendMessage(tabs[0].id, {text: clickData.selectionText});
    });
  }
})

bgInit()