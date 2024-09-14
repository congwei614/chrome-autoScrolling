
// 实现自动滚动的功能

let scrolling = false;
let scrollSpeed = 5;
let scrollDirection = 'down'; // 'down' 为向下滚动, 'up' 为向上滚动
let lastScrollTime = 0;
const scrollInterval = 16; // 控制滚动间隔为 16ms，等效于 60fps

function startScrolling() {
  if (!scrolling) {
    scrolling = true;
    lastScrollTime = performance.now();  // 初始化最后一次滚动的时间
    requestAnimationFrame(scrollPage);   // 使用 requestAnimationFrame 启动滚动
  }
}

function stopScrolling() {
  scrolling = false;  // 停止滚动
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

function toggleScrolling() {
  if (scrolling) {
    stopScrolling();
  } else {
    startScrolling();
  }
}

// 监听消息以启动、停止和调整滚动方向、速度
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'start') {
    startScrolling();
  } else if (message.action === 'stop') {
    stopScrolling();
  } else if (message.action === 'setSpeed') {
    scrollSpeed = message.speed;
  } else if (message.action === 'setDirection') {
    scrollDirection = message.direction;
  }


  switch (message.action) {
    case 'start':
      startScrolling();
      break;
    case 'stop':
      stopScrolling();
      break;
    case 'toggle':
      toggleScrolling()
      break;
    case 'setSpeed':
      scrollSpeed = message.speed;
      break;
    case 'setDirection':
      scrollDirection = message.direction;
      break;

  }
});

