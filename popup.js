
// 处理 UI 控制和消息传递

function updateStatus(type, value) {
  const container = document.getElementById('scroll-status');
  if (type === 'direction') document.getElementById('direction').innerText = value;
  else if (type === 'status') document.getElementById('status').innerText = value ? 'Started' : 'Stopped';

  // 添加切换状态的视觉效果
  container.classList.add('change');
  setTimeout(() => container.classList.remove('change'), 500);  // 动画结束后移除类名
}


const startHandle = () => {
  updateStatus('status', true)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'start' });
  });
}

const stopHandle = () => {
  updateStatus('status', false)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'stop' });
  });
}


const downHandle = () => {
  updateStatus('direction', 'down')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'setDirection', direction: 'down' });
  });
}

const upHandle = () => {
  updateStatus('direction', 'up')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'setDirection', direction: 'up' });
  });
}

const speedHandle = (event) => {
  const speed = event.target.value;
  document.getElementById('speedValue').textContent = speed;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'setSpeed', speed: parseInt(speed) });
  });
}

const toggleHandle = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
  });
}


document.getElementById('start').addEventListener('click', startHandle);
document.getElementById('stop').addEventListener('click', stopHandle);
document.getElementById('speed').addEventListener('click', speedHandle);
document.getElementById('scrollDown').addEventListener('click', downHandle);
document.getElementById('scrollUp').addEventListener('click', upHandle);



// TODO 关闭插件弹窗时仍然能使用快捷键
document.addEventListener('keydown', function (event) {
  // alert(scrolling)
  switch (event.key) {
    case 'ArrowUp':
      // scrollDirection = 'up';  // 修改为向上滚动
      // updateStatus('direction', 'up')
      upHandle()
      break;
    case 'ArrowDown':
      // scrollDirection = 'down';  // 修改为向下滚动
      // updateStatus('direction', 'down')
      downHandle()
      break;
    case ' ':
      // TODO 切换滚动时状态自动更新
      toggleHandle()
      // chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
      //   alert(response.data)
      //   console.log('Data received in popup.js:', response.data);
      //   // 你可以在 popup 中使用这些数据来更新 UI
      // });
      // if (scrolling) {
      //   stopScrolling();  // 空格键暂停滚动
      //   updateStatus('status', false)

      // } else {
      //   startScrolling();  // 空格键启动滚动
      //   updateStatus('status', true)

      // }
      break;
    case '+':  // 加速
      scrollSpeed = Math.min(scrollSpeed + 1, 20); // 最大速度 20
      break;
    case '-':  // 减速
      scrollSpeed = Math.max(scrollSpeed - 1, 1);  // 最小速度 1
      break;
  }
});

/**

// background.js

let isScrolling = false;
let scrollDirection = 'down';
let scrollSpeed = 2;

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

// content.js

let isScrolling = false;
let scrollSpeed = 2;
let scrollDirection = 'down';
let lastScrollTime = 0;

function scrollPage() {
  if (!isScrolling) return;

  const now = Date.now();
  if (now - lastScrollTime > 1000 / scrollSpeed) {
    if (scrollDirection === 'down') {
      window.scrollBy(0, scrollSpeed);
    } else if (scrollDirection === 'up') {
      window.scrollBy(0, -scrollSpeed);
    }
    lastScrollTime = now;
  }

  requestAnimationFrame(scrollPage);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startScroll') {
    scrollDirection = message.direction;
    scrollSpeed = message.speed;
    isScrolling = true;
    scrollPage();
  } else if (message.action === 'stopScroll') {
    isScrolling = false;
  }
});

// manifest.json
{
  "name": "Scroll Control",
  "description": "Control page scrolling with keyboard shortcuts",
  "version": "1.0",
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "permissions": ["tabs", "activeTab", "storage", "commands"],
  "commands": {
    "toggle-scroll": {
      "suggested_key": {
        "default": "Ctrl+Shift+S"
      },
      "description": "Start or stop scrolling"
    },
    "scroll-up": {
      "suggested_key": {
        "default": "Ctrl+Shift+Up"
      },
      "description": "Scroll up"
    },
    "scroll-down": {
      "suggested_key": {
        "default": "Ctrl+Shift+Down"
      },
      "description": "Scroll down"
    },
    "increase-speed": {
      "suggested_key": {
        "default": "Ctrl+Shift+Plus"
      },
      "description": "Increase scroll speed"
    },
    "decrease-speed": {
      "suggested_key": {
        "default": "Ctrl+Shift+Minus"
      },
      "description": "Decrease scroll speed"
    }
  }
}


*/