/**
 * 核心应用初始化模块
 */

// 全局状态变量
let showEpilepsyWarning = true;
let sysInfo = undefined;
let sysArch = undefined;
let androidVer = 0;

// 加载状态标记
const loadFlags = {
  fclDownWay1Loaded: false,
  fclDownWay2Loaded: false,
  fclDownWay3Loaded: false,
  fclDownWay4Loaded: false,
  fclDownWay5Loaded: false,
  fclDownWay6Loaded: false,
  fclDownWay7Loaded: false,
  fclDownWay8Loaded: false,
  zlDownWay1Loaded: false,
  ZlDownWay3Loaded: false,
  zlDownWay7Loaded: false,
  zl2DownWay1Loaded: false,
  zl2DownWay2Loaded: false,
  zl2DownWay3Loaded: false,
  zl2DownWay7Loaded: false,
  plDownWay7Loaded: false,
  pliosDownWay7Loaded: false,
  hmclpeDownWay7Loaded: false,
  mcinaboxDownWay7Loaded: false,
  renderDownWay1Loaded: false,
  renderDownWay3Loeded: false,
  renderDownWay7Loaded: false,
  mgRenderDownWay7Loaded: false,
  driverDownWay1Loaded: false,
  driverDownWay7Loaded: false,
  driverDownWay8Loaded: false,
  jreDownWay7Loaded: false,
  downLinksLoaded: false,
  checksumsLoaded: false,
  aboutLoaded: false
};

// 模块加载时间记录
const moduleLoadTimes = {};

// 重要任务列表（前台运行不能跳过）
const criticalTasks = [
  '主题偏好获取',
  '主题加载',
  '地址栏参数解析',
  '事件监听器添加',
  '运作时间加载',
  '定时器添加',
  '按钮冷却添加',
  '加载提示移除'
];

// 后台任务列表（可以延迟加载）
const backgroundTasks = [
  '设备信息获取',
  '开门见山链接获取',
  '公告打开',
  '下载TAB内容获取',
  'FCL线路2流量加载'
];

/**
 * 记录模块加载时间
 * @param {string} moduleName - 模块名称
 * @param {number} startTime - 开始时间
 * @param {boolean} isCritical - 是否为重要任务
 */
function recordModuleLoadTime(moduleName, startTime, isCritical = false) {
  const endTime = performance.now();
  const loadTime = Math.round(endTime - startTime);
  moduleLoadTimes[moduleName] = {
    time: loadTime,
    isCritical: isCritical
  };
  console.log(`模块 ${moduleName} 加载用时: ${loadTime}ms ${isCritical ? '(重要任务)' : '(后台任务)'}`);
}

/**
 * 显示各模块加载时间（按重要性分类）
 */
function displayModuleLoadTimes() {
  const moduleLoadTimesList = document.getElementById('moduleLoadTimesList');
  const moduleLoadTimesContainer = document.getElementById('moduleLoadTimes');
  
  if (moduleLoadTimesList && moduleLoadTimesContainer) {
    // 清空现有内容
    moduleLoadTimesList.innerHTML = '';
    
    // 添加标题
    const criticalTitle = document.createElement('h3');
    criticalTitle.textContent = '重要任务（前台运行不能跳过）';
    moduleLoadTimesList.appendChild(criticalTitle);
    
    // 添加重要任务
    let criticalFound = false;
    for (const [moduleName, data] of Object.entries(moduleLoadTimes)) {
      if (data.isCritical) {
        const li = document.createElement('li');
        li.textContent = `${moduleName}: ${data.time}ms`;
        moduleLoadTimesList.appendChild(li);
        criticalFound = true;
      }
    }
    
    if (!criticalFound) {
      const li = document.createElement('li');
      li.textContent = '暂无重要任务';
      moduleLoadTimesList.appendChild(li);
    }
    
    // 添加后台任务标题
    const backgroundTitle = document.createElement('h3');
    backgroundTitle.textContent = '后台任务（可延迟加载）';
    moduleLoadTimesList.appendChild(backgroundTitle);
    
    // 添加后台任务
    let backgroundFound = false;
    for (const [moduleName, data] of Object.entries(moduleLoadTimes)) {
      if (!data.isCritical) {
        const li = document.createElement('li');
        li.textContent = `${moduleName}: ${data.time}ms`;
        moduleLoadTimesList.appendChild(li);
        backgroundFound = true;
      }
    }
    
    if (!backgroundFound) {
      const li = document.createElement('li');
      li.textContent = '暂无后台任务';
      moduleLoadTimesList.appendChild(li);
    }
    
    // 显示容器
    moduleLoadTimesContainer.style.display = 'block';
  }
}

/**
 * 初始化应用
 */
async function initApp() {
  // 记录加载开始时间
  const startTime = performance.now();
  
  // 使用IIFE和async/await重构回调地狱
  try {
    // 获取系统主题色偏好（重要任务）
    const themePrefStart = performance.now();
    await nextFrame('获取系统主题色偏好...', 12);
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches ? 'dark' : 'light');
    }
    recordModuleLoadTime('主题偏好获取', themePrefStart, true);

    // 加载主题（重要任务）
    const themeLoadStart = performance.now();
    await nextFrame('加载主题…', 18);
    loadTheme();
    recordModuleLoadTime('主题加载', themeLoadStart, true);

    // 初始化地址栏参数解析（重要任务）
    const hashRoutingStart = performance.now();
    await nextFrame('初始化地址栏参数解析…', 24);
    handleHashRouting();
    recordModuleLoadTime('地址栏参数解析', hashRoutingStart, true);

    // 添加事件监听（重要任务）
    const eventListenerStart = performance.now();
    await nextFrame('添加事件监听…', 30);
    window.addEventListener('hashchange', handleHashRouting);
    document.getElementById('loadDownLinks').addEventListener('click', loadDownLinks);
    document.getElementById('loadChecksums').addEventListener('click', loadChecksums);
    document.getElementById('loadAbout').addEventListener('click', loadAbout);
    recordModuleLoadTime('事件监听器添加', eventListenerStart, true);

    // 后台任务处理
    // 获取系统信息（后台任务）
    const deviceInfoStart = performance.now();
    // 使用setTimeout将设备信息获取改为非阻塞操作
    setTimeout(async () => {
      await showDeviceInfo();
      recordModuleLoadTime('设备信息获取', deviceInfoStart, false);
    }, 0);

    // 获取开门见山链接（后台任务）
    const odlmStart = performance.now();
    // 使用setTimeout将开门见山链接获取改为非阻塞操作
    setTimeout(async () => {
      const odlm = document.getElementById('odlmSelect');
      if (odlm) {
        await setupIndexDownLinks(odlm.value);
      }
      recordModuleLoadTime('开门见山链接获取', odlmStart, false);
    }, 0);

    // 加载运作时间（重要任务）
    const runTimeStart = performance.now();
    await nextFrame('加载运作时间…', 60);
    await loadRunTime();
    recordModuleLoadTime('运作时间加载', runTimeStart, true);

    // 添加定时器（重要任务）
    const timerStart = performance.now();
    await nextFrame('添加定时器…', 72);
    setInterval(loadRunTime, 1000);
    // setInterval(loadFclDownWay2Info, 60000);
    recordModuleLoadTime('定时器添加', timerStart, true);

    // 添加按钮冷却（重要任务）
    const cooldownStart = performance.now();
    await nextFrame('添加按钮冷却...', 78);
    setCoolDown();
    recordModuleLoadTime('按钮冷却添加', cooldownStart, true);

    // 等待其它乱七八糟的东西
    await nextFrame('等待其它乱七八糟的东西…', 84);

    // 移除此提示（重要任务）
    const removeTipStart = performance.now();
    await nextFrame('移除此提示…', 90);
    removeLoadTip();
    recordModuleLoadTime('加载提示移除', removeTipStart, true);
    
    // 后台任务处理
    // 打开公告（后台任务）
    const noticeStart = performance.now();
    // 使用setTimeout将公告显示改为非阻塞操作
    setTimeout(async () => {
      await openNotice();
      recordModuleLoadTime('公告打开', noticeStart, false);
      
      // 计算并显示加载时长
      const endTime = performance.now();
      console.log("加载时间统计结束",startTime,endTime)
      const loadTime = Math.round(endTime - startTime);
      mdui.snackbar({
        message: `加载完成，用时 ${loadTime}ms`,
        position: 'right-bottom',
        timeout: 3000
      });

      // 更新公告中的加载时间显示
      const loadTimeElement = document.getElementById('loadTimeDisplay');
      if (loadTimeElement) {
        loadTimeElement.textContent = `${loadTime}ms`;
      } else {
        console.log('未找到loadTimeDisplay元素');
      }

      // 显示各模块加载时间
      displayModuleLoadTimes();
    }, 0);

    // 获取下载TAB内容（后台任务）
    const downLinksStart = performance.now();
    // 延迟加载下载TAB内容，提高初始加载速度
    setTimeout(async () => {
      await loadDownLinks();
      recordModuleLoadTime('下载TAB内容获取', downLinksStart, false);
    }, 100);

    // 加载FCL线路2流量（后台任务）
    const fclTrafficStart = performance.now();
    // 延迟加载FCL线路2流量，因为不是关键路径
    setTimeout(async () => {
      await loadFclDownWay2Info();
      recordModuleLoadTime('FCL线路2流量加载', fclTrafficStart, false);
    }, 200);

    // 延迟加载非关键模块
    setTimeout(() => {
      // 延迟加载赞助列表
      const sponsorTab = document.querySelector('[href="#tab4"]');
      if (sponsorTab) {
        sponsorTab.addEventListener('click', () => {
          const sponsorList = document.getElementById('sponsorList');
          if (sponsorList && sponsorList.children.length === 1) {
            loadSponsorList();
          }
        });
      }
      
      // 延迟加载关于页面
      const aboutTab = document.querySelector('[href="#tab5"]');
      if (aboutTab) {
        aboutTab.addEventListener('click', () => {
          const aboutTabElement = document.getElementById('tab5');
          if (aboutTabElement && aboutTabElement.children.length === 1) {
            loadAbout();
          }
        });
      }
    }, 1000);

    

  } catch (error) {
    console.error('初始化应用：出错：', error);
    updateStatus('初始化过程中出错', 100);
  }
}



/**
 * 封装requestAnimationFrame，返回Promise并更新状态
 * @param {string} statusText - 状态文本
 * @param {number} progressNum - 进度百分比
 * @returns {Promise<void>}
 */
function nextFrame(statusText, progressNum) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      updateStatus(statusText, progressNum);
      resolve();
    });
  });
}

// 导出模块内容
export {
  showEpilepsyWarning,
  sysInfo,
  sysArch,
  androidVer,
  loadFlags,
  moduleLoadTimes,
  initApp,
  nextFrame,
  recordModuleLoadTime,
  displayModuleLoadTimes
};