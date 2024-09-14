
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