
// 实现自动滚动的功能

let scrolling = false;
let scrollSpeed = 10;
let scrollDirection = 'down'; // 'down' 为向下滚动, 'up' 为向上滚动
let lastScrollTime = 0;
const scrollInterval = 16; // 控制滚动间隔为 16ms，等效于 60fps

// 初始化控制面板
let controlPanel
function startScrolling() {
  if (!scrolling) {

    scrolling = true;
    lastScrollTime = performance.now();  // 初始化最后一次滚动的时间
    requestAnimationFrame(scrollPage);   // 使用 requestAnimationFrame 启动滚动
    controlPanel?.setStatus("Scrolling")
  }
}

function stopScrolling() {
  scrolling = false;  // 停止滚动
  controlPanel?.setStatus('Stopped');
}

function scrollPage(timestamp) {
  if (!scrolling) return;  // 检查是否正在滚动

  // 使用 timestamp 确定滚动是否该执行，避免频繁滚动
  const timeElapsed = timestamp - lastScrollTime;

  if (timeElapsed >= scrollInterval) {
    if (scrollDirection === 'down') {
      window.scrollBy(0, scrollSpeed);  // 向下滚动
    } else if (scrollDirection === 'up') {
      window.scrollBy(0, -scrollSpeed); // 向上滚动
    }
    lastScrollTime = timestamp;  // 更新最后滚动时间
  }

  // 继续下一帧滚动
  requestAnimationFrame(scrollPage);
}


// 监听消息以启动、停止和调整滚动方向、速度
chrome.runtime.onMessage.addListener((message) => {
  // 快捷键事件
  if (message.action === 'startScroll') {
    if (!controlPanel) {
      controlPanel = createControlPanel();
    }
    scrollDirection = message.direction;
    controlPanel.setDirection(scrollDirection);
    scrollSpeed = message.speed;
    controlPanel.setSpeed(scrollSpeed);

    startScrolling();
  } else if (message.action === 'stopScroll') {
    stopScrolling();
    controlPanel?.clearPanel()
    controlPanel = null
  } else if (message.action === 'pauseScroll') {
    scrolling = false; // 暂停滚动
  } else if (message.action === 'resumeScroll') {
    scrolling = true; // 恢复滚动
    scrollPage();     // 重新启动滚动
  }

  // 页面按钮事件
  switch (message.action) {
    case 'start':
      if (!controlPanel) {
        controlPanel = createControlPanel();
      }
      startScrolling();
      break;
    case 'stop':
      controlPanel?.clearPanel()
      controlPanel = null
      stopScrolling();
      break;
    case 'setSpeed':
      scrollSpeed = message.speed;
      controlPanel.setSpeed(scrollSpeed);
      break;
    case 'setDirection':
      scrollDirection = message.direction;
      controlPanel.setDirection(scrollDirection);
      break;
  }
});

function createControlPanel() {
  const controlPanel = document.createElement('div');
  controlPanel.id = 'control-panel';
  controlPanel.style.position = 'fixed';
  controlPanel.style.top = '2%';
  controlPanel.style.left = '0';
  controlPanel.style.zIndex = '9999';

  // 添加控制面板的内容，例如启动/停止按钮和方向显示
  controlPanel.innerHTML = `
  <div id="scroll-status" class="scroll-container">
    <div class="status-text" id="scroll-status">
      Direction: <span id="direction" class="active">Down</span>
    </div>
    <div class="status-text" id="scroll-direction">
      Status: <span id="status" class="no_active">Stopped</span>
    </div>
    <div class="status-text " id="scroll-speed">
      Speed: <span id="speed">${scrollSpeed}</span>
    </div>
  </div>
`;

  // 将控制面板添加到页面的 body 中
  document.body.appendChild(controlPanel);


  return {

    setStatus: (status) => {
      controlPanel.querySelector("#scroll-status span").innerHTML = status
    },
    setDirection: (direction) => {
      controlPanel.querySelector("#scroll-direction span").innerHTML = direction
    },
    setSpeed: (speed) => {
      controlPanel.querySelector("#scroll-speed span").innerHTML = speed
    },
    clearPanel: () => {
      controlPanel.remove()
    }
  }
}


const setStyle = () => {
  // 创建样式并插入到页面中
  const style = document.createElement('style');
  style.innerHTML = `
  .scroll-container {
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 20px;
    color: white;
    font-family: 'Arial', sans-serif;
    font-size: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    opacity: 1;
    margin-bottom: 15px;
  }

  .scroll-container.hide {
    opacity: 0;
    transform: translateX(-100%);
  }

  .status-text {
    margin-bottom: 10px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }

  .status-text span {
    color: #4caf50; /* 激活状态绿色 */
  }

  .status-text span.no_active {
    color: #af4c4c; /* 停止状态红色 */
  }

  @keyframes statusChange {
    0% {
      transform: scale(1);
      background-color: rgba(0, 0, 0, 0.7);
    }
    50% {
      transform: scale(1.1);
      background-color: rgba(0, 100, 0, 0.9);
    }
    100% {
      transform: scale(1);
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

  .scroll-container.change {
    animation: statusChange 0.5s ease-in-out;
  }
`;
  document.head.appendChild(style);
}
setStyle()