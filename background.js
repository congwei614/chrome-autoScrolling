
// 用于监听插件的启动和操作命令

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    console.log('Content script injected');
  });
});



