import {apiWrap} from '../utils/apiWithPort'
import {openPDFReader,onInstall, bgInit} from '../utils/chromeApi'

chrome.runtime.onConnect.addListener(function (port:chrome.runtime.Port) {
  port.onMessage.addListener(async function (msg: any) {
    // @ts-ignore
    apiWrap[port.name](msg, port)
  })
})

// chrome.action.setBadgeText({text: '2'})
// chrome.action.getPopup({})
// chrome.action.setTitle('4')

chrome.commands.onCommand.addListener(function (command: any) {
  // console.log('Conmmand', command)
})

chrome.runtime.onInstalled.addListener((details) => {
  let transMsg:string;
  let openPDFMsg:string;
  const lang = navigator.language
  if (lang === 'zh-CN' || lang === 'zh') {
    transMsg = '翻译';
    openPDFMsg = 'PDF阅读器(用于翻译)';
  } else if (lang === 'zh-TW' || lang === 'zh-HK') {
    transMsg = '翻譯'
    openPDFMsg = 'PDF閱讀器(用於翻譯)';
  } else {
    transMsg = 'translate'
    openPDFMsg = 'PDF Reader For Translate'
  }

  const pdfActionMenu:chrome.contextMenus.CreateProperties = {
    id: "actionPdfReader",
    title: openPDFMsg,
    contexts: ['action', 'browser_action', 'page_action'],
  }

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

chrome.runtime.setUninstallURL("https://www.fishfit.fun/bqy/web/uninstall", () => {})

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