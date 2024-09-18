
// 用于监听插件的启动和操作命令

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    console.log('Content script injected');
  });
});



// background.js

let isScrolling = false;
let scrollDirection = 'down';
let scrollSpeed = 10;

function startScrolling() {
  isScrolling = true;
  // 使用消息通知 content.js 开始滚动
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'startScroll', direction: scrollDirection, speed: scrollSpeed });
  });
}

function stopScrolling() {
  isScrolling = false;
  // 使用消息通知 content.js 停止滚动
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopScroll' });
  });
}


chrome.commands.onCommand.addListener((command) => {

  switch (command) {
    case 'toggle-scroll':
      if (isScrolling) {
        stopScrolling();
      } else {
        startScrolling();
      }
      break;
    case 'scroll-up':
      scrollDirection = 'up';
      if (isScrolling) {
        startScrolling(); // 更新方向并重新启动滚动
      }
      break;
    case 'scroll-down':
      scrollDirection = 'down';
      if (isScrolling) {
        startScrolling();
      }
      break;
    case 'increase-speed':
      scrollSpeed = Math.min(scrollSpeed + 1, 20); // 最大速度 20
      if (isScrolling) {
        startScrolling(); // 更新速度并重新启动滚动
      }
      break;
    case 'decrease-speed':
      scrollSpeed = Math.max(scrollSpeed - 1, 1); // 最小速度 1
      if (isScrolling) {
        startScrolling();
      }
      break;
  }
});


let wasScrolling = false; // 保存切换标签页前的滚动状态

// 监听标签页切换事件
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.active) {
      // 用户切换回活动标签页
      if (wasScrolling) {
        // 恢复滚动
        chrome.runtime.sendMessage({ action: 'resumeScroll' });
        wasScrolling = false;
      }
    } else {
      // 标签页变为非活动状态
      if (isScrolling) {
        // 暂停滚动
        wasScrolling = true;
        chrome.runtime.sendMessage({ action: 'pauseScroll' });
      }
    }
  });
});

// 监听窗口焦点变化
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // 窗口最小化或失去焦点
    if (isScrolling) {
      wasScrolling = true;
      chrome.runtime.sendMessage({ action: 'pauseScroll' });
    }
  } else {
    // 窗口恢复
    if (wasScrolling) {
      chrome.runtime.sendMessage({ action: 'resumeScroll' });
      wasScrolling = false;
    }
  }
});