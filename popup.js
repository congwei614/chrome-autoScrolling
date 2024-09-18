
// 处理 UI 控制和消息传递

function updateStatus(type, value) {
  const container = document.getElementById('scroll-status');
  if (type === 'direction') document.getElementById('direction').innerText = value;
  else if (type === 'status') {
    document.getElementById('status').innerText = value ? 'Started' : 'Stopped';
    document.getElementById('status').class = value ? 'active' : 'no_active';
  }

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




// document.getElementById('start').addEventListener('click', startHandle);
// document.getElementById('stop').addEventListener('click', stopHandle);
// document.getElementById('speed').addEventListener('click', speedHandle);
// document.getElementById('scrollDown').addEventListener('click', downHandle);
// document.getElementById('scrollUp').addEventListener('click', upHandle);

