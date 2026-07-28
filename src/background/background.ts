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

chrome.commands.onCommand.addListener(function (command: string) {
  switch (command) {
    case 'toggleTranslatePage':
      // 向当前活动标签页发送切换指令
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePageTrans' })
        }
      })
      break
  }
})

chrome.runtime.onInstalled.addListener((details) => {
  let transMsg:string;
  let pageTransMsg:string;
  let openPDFMsg:string;
  const lang = navigator.language
  if (lang === 'zh-CN' || lang === 'zh') {
    transMsg = '翻译';
    pageTransMsg = '翻译此页面';
    openPDFMsg = 'PDF阅读器(用于翻译)';
  } else if (lang === 'zh-TW' || lang === 'zh-HK') {
    transMsg = '翻譯'
    pageTransMsg = '翻譯此頁面';
    openPDFMsg = 'PDF閱讀器(用於翻譯)';
  } else if (lang === 'ja' || lang === 'ja-JP') {
    transMsg = '翻訳';
    pageTransMsg = 'このページを翻訳';
    openPDFMsg = 'PDFリーダー（翻訳用）';
  } else if (lang.startsWith('fr')) {
    transMsg = 'Traduire';
    pageTransMsg = 'Traduire cette page';
    openPDFMsg = 'Lecteur PDF (pour la traduction)';
  } else {
    transMsg = 'translate'
    pageTransMsg = 'Translate this page'
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
  const pageTransMenuItem:chrome.contextMenus.CreateProperties = {
    id: "pageTrans",
    title: pageTransMsg,
    contexts: ['page', 'selection']
  }
  chrome.contextMenus.create(pdfActionMenu)
  chrome.storage.sync.get(['pageTransMenu', 'menuTrans'], (res) => {
    if (res.pageTransMenu !== false) {
      chrome.contextMenus.create(pageTransMenuItem)
    }
    if (res.menuTrans === false) return
    chrome.contextMenus.create(transMenuItem)
  })

  onInstall(details)
  
})


chrome.contextMenus.onClicked.addListener(function (clickData) {
  if(clickData.menuItemId === "actionPdfReader") {
    openPDFReader('actionMenu')
  } else if(clickData.menuItemId === 'pageTrans') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      if(tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePageTrans' });
      }
    });
  } else if(clickData.menuItemId === 'trans') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      chrome.tabs.sendMessage(tabs[0].id, {text: clickData.selectionText});
    });
  }
})

bgInit()