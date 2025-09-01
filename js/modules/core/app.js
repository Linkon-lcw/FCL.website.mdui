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
 * 更新详细计时信息到公告中
 */
function updateTimingInNotice(moduleName, startTime, isRealTime = false) {
  // 获取或创建详细计时容器
  let detailedTimingContainer = document.getElementById('detailedTimingContainer');
  if (!detailedTimingContainer) {
    // 查找页面加载性能面板
    const performancePanel = document.querySelector('.mdui-panel-item-body:has(#loadTimeDisplay)');
    if (performancePanel) {
      // 创建详细计时容器
      detailedTimingContainer = document.createElement('div');
      detailedTimingContainer.id = 'detailedTimingContainer';
      detailedTimingContainer.className = 'mdui-m-t-2';
      
      // 创建标题
      const title = document.createElement('p');
      title.textContent = '详细计时信息:';
      detailedTimingContainer.appendChild(title);
      
      // 创建列表
      const timingList = document.createElement('ul');
      timingList.id = 'detailedTimingList';
      detailedTimingContainer.appendChild(timingList);
      
      // 添加到面板
      performancePanel.appendChild(detailedTimingContainer);
    }
  }
  
  // 如果容器存在
  if (detailedTimingContainer) {
    const timingList = document.getElementById('detailedTimingList');
    if (timingList) {
      // 计算耗时
      const currentTime = performance.now();
      const elapsedTime = Math.round(currentTime - startTime);
      
      // 查找现有条目
      let existingItem = null;
      for (let i = 0; i < timingList.children.length; i++) {
        const item = timingList.children[i];
        if (item.dataset.module === moduleName) {
          existingItem = item;
          break;
        }
      }
      
      // 创建或更新条目
      if (existingItem) {
        // 更新现有条目
        existingItem.textContent = `${moduleName}: ${elapsedTime}ms${isRealTime ? ' (实时更新中...)' : ''}`;
      } else {
        // 创建新条目
        const newItem = document.createElement('li');
        newItem.dataset.module = moduleName;
        newItem.textContent = `${moduleName}: ${elapsedTime}ms${isRealTime ? ' (实时更新中...)' : ''}`;
        timingList.appendChild(newItem);
      }
    }
  }
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
  // 使用从main.js传入的应用开始时间
  const startTime = window.appStartTime || performance.now();
  console.log(`initApp：开始执行，从应用启动算起用时 ${Math.round(performance.now() - startTime)}ms`);
  
  // 更新公告中的实时计时
  updateTimingInNotice('应用启动', startTime, true);
  
  // 记录初始化开始时间
  const initStart = performance.now();
  updateTimingInNotice('initApp开始', initStart);
  
  // 使用IIFE和async/await重构回调地狱
  try {
    console.log(`initApp：进入try-catch块，用时 ${Math.round(performance.now() - initStart)}ms`);
    updateTimingInNotice('进入try-catch块', initStart);
    // 获取系统主题色偏好（重要任务）
    const themePrefStart = performance.now();
    console.log(`initApp：开始获取系统主题色偏好，用时 ${Math.round(themePrefStart - initStart)}ms`);
    updateTimingInNotice('主题偏好获取开始', themePrefStart);
    await nextFrame('获取系统主题色偏好...', 12);
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches ? 'dark' : 'light');
    }
    recordModuleLoadTime('主题偏好获取', themePrefStart, true);
    updateTimingInNotice('主题偏好获取完成', themePrefStart);

    // 加载主题（重要任务）
    const themeLoadStart = performance.now();
    console.log(`initApp：开始加载主题，用时 ${Math.round(themeLoadStart - initStart)}ms`);
    updateTimingInNotice('主题加载开始', themeLoadStart);
    await nextFrame('加载主题…', 18);
    loadTheme();
    recordModuleLoadTime('主题加载', themeLoadStart, true);
    updateTimingInNotice('主题加载完成', themeLoadStart);

    // 初始化地址栏参数解析（重要任务）
    const hashRoutingStart = performance.now();
    console.log(`initApp：开始初始化地址栏参数解析，用时 ${Math.round(hashRoutingStart - initStart)}ms`);
    updateTimingInNotice('地址栏参数解析开始', hashRoutingStart);
    await nextFrame('初始化地址栏参数解析…', 24);
    handleHashRouting();
    recordModuleLoadTime('地址栏参数解析', hashRoutingStart, true);
    updateTimingInNotice('地址栏参数解析完成', hashRoutingStart);

    // 添加事件监听（重要任务）
    const eventListenerStart = performance.now();
    console.log(`initApp：开始添加事件监听，用时 ${Math.round(eventListenerStart - initStart)}ms`);
    updateTimingInNotice('事件监听器添加开始', eventListenerStart);
    await nextFrame('添加事件监听…', 30);
    window.addEventListener('hashchange', handleHashRouting);
    document.getElementById('loadDownLinks').addEventListener('click', loadDownLinks);
    document.getElementById('loadChecksums').addEventListener('click', loadChecksums);
    document.getElementById('loadAbout').addEventListener('click', loadAbout);
    recordModuleLoadTime('事件监听器添加', eventListenerStart, true);
    updateTimingInNotice('事件监听器添加完成', eventListenerStart);

    // 后台任务处理
    // 获取系统信息（后台任务）
    const deviceInfoStart = performance.now();
    console.log(`initApp：开始准备后台任务（设备信息获取），用时 ${Math.round(deviceInfoStart - initStart)}ms`);
    updateTimingInNotice('设备信息获取准备', deviceInfoStart);
    // 使用setTimeout将设备信息获取改为非阻塞操作
    setTimeout(async () => {
      const deviceInfoInnerStart = performance.now();
      updateTimingInNotice('设备信息获取开始', deviceInfoInnerStart);
      await showDeviceInfo();
      recordModuleLoadTime('设备信息获取', deviceInfoStart, false);
      updateTimingInNotice('设备信息获取完成', deviceInfoInnerStart);
    }, 0);

    // 获取开门见山链接（后台任务）
    const odlmStart = performance.now();
    console.log(`initApp：开始准备后台任务（开门见山链接获取），用时 ${Math.round(odlmStart - initStart)}ms`);
    updateTimingInNotice('开门见山链接获取准备', odlmStart);
    // 使用setTimeout将开门见山链接获取改为非阻塞操作
    setTimeout(async () => {
      const odlm = document.getElementById('odlmSelect');
      const odlmInnerStart = performance.now();
      updateTimingInNotice('开门见山链接获取开始', odlmInnerStart);
      if (odlm) {
        await setupIndexDownLinks(odlm.value);
      }
      recordModuleLoadTime('开门见山链接获取', odlmStart, false);
      updateTimingInNotice('开门见山链接获取完成', odlmInnerStart);
    }, 0);

    // 加载运作时间（重要任务）
    const runTimeStart = performance.now();
    console.log(`initApp：开始加载运作时间，用时 ${Math.round(runTimeStart - initStart)}ms`);
    updateTimingInNotice('运作时间加载开始', runTimeStart);
    await nextFrame('加载运作时间…', 60);
    await loadRunTime();
    recordModuleLoadTime('运作时间加载', runTimeStart, true);
    updateTimingInNotice('运作时间加载完成', runTimeStart);

    // 添加定时器（重要任务）
    const timerStart = performance.now();
    console.log(`initApp：开始添加定时器，用时 ${Math.round(timerStart - initStart)}ms`);
    updateTimingInNotice('定时器添加开始', timerStart);
    await nextFrame('添加定时器…', 72);
    setInterval(loadRunTime, 1000);
    // setInterval(loadFclDownWay2Info, 60000);
    recordModuleLoadTime('定时器添加', timerStart, true);
    updateTimingInNotice('定时器添加完成', timerStart);

    // 添加按钮冷却（重要任务）
    const cooldownStart = performance.now();
    console.log(`initApp：开始添加按钮冷却，用时 ${Math.round(cooldownStart - initStart)}ms`);
    updateTimingInNotice('按钮冷却添加开始', cooldownStart);
    await nextFrame('添加按钮冷却...', 78);
    setCoolDown();
    recordModuleLoadTime('按钮冷却添加', cooldownStart, true);
    updateTimingInNotice('按钮冷却添加完成', cooldownStart);

    // 等待其它乱七八糟的东西
    const waitOtherStart = performance.now();
    console.log(`initApp：开始等待其它乱七八糟的东西，用时 ${Math.round(waitOtherStart - initStart)}ms`);
    updateTimingInNotice('等待其它操作开始', waitOtherStart);
    await nextFrame('等待其它乱七八糟的东西…', 84);
    const waitOtherEnd = performance.now();
    console.log(`initApp：等待其它乱七八糟的东西完成，用时 ${Math.round(waitOtherEnd - waitOtherStart)}ms`);
    updateTimingInNotice('等待其它操作完成', waitOtherStart);

    // 移除此提示（重要任务）
    const removeTipStart = performance.now();
    console.log(`initApp：开始移除此提示，用时 ${Math.round(removeTipStart - initStart)}ms`);
    updateTimingInNotice('加载提示移除开始', removeTipStart);
    await nextFrame('移除此提示…', 90);
    removeLoadTip();
    recordModuleLoadTime('加载提示移除', removeTipStart, true);
    updateTimingInNotice('加载提示移除完成', removeTipStart);
    
    // 后台任务处理
    // 打开公告（后台任务）
    const noticeStart = performance.now();
    console.log(`initApp：开始准备后台任务（公告打开），用时 ${Math.round(noticeStart - initStart)}ms`);
    updateTimingInNotice('公告打开准备', noticeStart);
    // 使用setTimeout将公告显示改为非阻塞操作
    setTimeout(async () => {
      const noticeInnerStart = performance.now();
      console.log(`公告打开任务：开始执行，用时 ${Math.round(noticeInnerStart - noticeStart)}ms`);
      updateTimingInNotice('公告打开开始', noticeInnerStart);
      
      await openNotice();
      recordModuleLoadTime('公告打开', noticeStart, false);
      const noticeEnd = performance.now();
      console.log(`公告打开任务：公告打开完成，用时 ${Math.round(noticeEnd - noticeInnerStart)}ms`);
      updateTimingInNotice('公告打开完成', noticeInnerStart);
      
      // 计算并显示加载时长
      const calcLoadTimeStart = performance.now();
      console.log(`公告打开任务：开始计算并显示加载时长，用时 ${Math.round(calcLoadTimeStart - noticeInnerStart)}ms`);
      updateTimingInNotice('计算加载时长开始', calcLoadTimeStart);
      
      const endTime = performance.now();
      console.log("加载时间统计结束",startTime,endTime)
      const loadTime = Math.round(endTime - startTime);
      mdui.snackbar({
        message: `加载完成，用时 ${loadTime}ms`,
        position: 'right-bottom',
        timeout: 3000
      });
      const calcLoadTimeEnd = performance.now();
      console.log(`公告打开任务：计算并显示加载时长完成，用时 ${Math.round(calcLoadTimeEnd - calcLoadTimeStart)}ms`);
      updateTimingInNotice('计算加载时长完成', calcLoadTimeStart);

      // 更新公告中的加载时间显示
      const updateLoadTimeStart = performance.now();
      console.log(`公告打开任务：开始更新loadTimeDisplay元素，用时 ${Math.round(updateLoadTimeStart - noticeInnerStart)}ms`);
      updateTimingInNotice('更新加载时间显示开始', updateLoadTimeStart);
      
      const loadTimeElement = document.getElementById('loadTimeDisplay');
      if (loadTimeElement) {
        loadTimeElement.textContent = `${loadTime}ms`;
        console.log(`公告打开任务：loadTimeDisplay元素更新完成，用时 ${Math.round(performance.now() - updateLoadTimeStart)}ms`);
        updateTimingInNotice('更新加载时间显示完成', updateLoadTimeStart);
      } else {
        console.log('未找到loadTimeDisplay元素');
      }

      // 显示各模块加载时间
      const displayModulesStart = performance.now();
      console.log(`公告打开任务：开始显示各模块加载时间，用时 ${Math.round(displayModulesStart - noticeInnerStart)}ms`);
      updateTimingInNotice('显示模块加载时间开始', displayModulesStart);
      
      displayModuleLoadTimes();
      console.log(`公告打开任务：显示各模块加载时间完成，用时 ${Math.round(performance.now() - displayModulesStart)}ms`);
      updateTimingInNotice('显示模块加载时间完成', displayModulesStart);
      
      const noticeTaskEnd = performance.now();
      console.log(`公告打开任务：总耗时 ${Math.round(noticeTaskEnd - noticeInnerStart)}ms`);
      updateTimingInNotice('公告打开任务总耗时', noticeInnerStart);
    }, 0);

    // 获取下载TAB内容（后台任务）
    const downLinksStart = performance.now();
    console.log(`initApp：开始准备后台任务（下载TAB内容获取），用时 ${Math.round(downLinksStart - initStart)}ms`);
    updateTimingInNotice('下载TAB内容获取准备', downLinksStart);
    // 延迟加载下载TAB内容，提高初始加载速度
    setTimeout(async () => {
      const downLinksInnerStart = performance.now();
      console.log(`下载TAB内容获取任务：开始执行，用时 ${Math.round(downLinksInnerStart - downLinksStart)}ms`);
      updateTimingInNotice('下载TAB内容获取开始', downLinksInnerStart);
      
      await loadDownLinks();
      recordModuleLoadTime('下载TAB内容获取', downLinksStart, false);
      
      console.log(`下载TAB内容获取任务：完成，用时 ${Math.round(performance.now() - downLinksInnerStart)}ms`);
      updateTimingInNotice('下载TAB内容获取完成', downLinksInnerStart);
    }, 100);

    // 加载FCL线路2流量（后台任务）
    const fclTrafficStart = performance.now();
    console.log(`initApp：开始准备后台任务（FCL线路2流量加载），用时 ${Math.round(fclTrafficStart - initStart)}ms`);
    updateTimingInNotice('FCL线路2流量加载准备', fclTrafficStart);
    // 延迟加载FCL线路2流量，因为不是关键路径
    setTimeout(async () => {
      const fclTrafficInnerStart = performance.now();
      console.log(`FCL线路2流量加载任务：开始执行，用时 ${Math.round(fclTrafficInnerStart - fclTrafficStart)}ms`);
      updateTimingInNotice('FCL线路2流量加载开始', fclTrafficInnerStart);
      
      await loadFclDownWay2Info();
      recordModuleLoadTime('FCL线路2流量加载', fclTrafficStart, false);
      
      console.log(`FCL线路2流量加载任务：完成，用时 ${Math.round(performance.now() - fclTrafficInnerStart)}ms`);
      updateTimingInNotice('FCL线路2流量加载完成', fclTrafficInnerStart);
    }, 200);

    // 延迟加载非关键模块
    const nonCriticalLoadStart = performance.now();
    console.log(`initApp：开始准备延迟加载非关键模块，用时 ${Math.round(nonCriticalLoadStart - initStart)}ms`);
    updateTimingInNotice('延迟加载非关键模块准备', nonCriticalLoadStart);
    setTimeout(() => {
      const nonCriticalInnerStart = performance.now();
      console.log(`延迟加载非关键模块任务：开始执行，用时 ${Math.round(nonCriticalInnerStart - nonCriticalLoadStart)}ms`);
      updateTimingInNotice('延迟加载非关键模块开始', nonCriticalInnerStart);
      
      // 延迟加载赞助列表
      const sponsorBindStart = performance.now();
      console.log(`延迟加载非关键模块任务：开始赞助列表事件绑定，用时 ${Math.round(sponsorBindStart - nonCriticalInnerStart)}ms`);
      updateTimingInNotice('赞助列表事件绑定开始', sponsorBindStart);
      
      const sponsorTab = document.querySelector('[href="#tab4"]');
      if (sponsorTab) {
        sponsorTab.addEventListener('click', () => {
          const sponsorList = document.getElementById('sponsorList');
          if (sponsorList && sponsorList.children.length === 1) {
            console.log('延迟加载赞助列表：开始执行');
            const sponsorLoadStart = performance.now();
            updateTimingInNotice('赞助列表加载开始', sponsorLoadStart);
            loadSponsorList();
            console.log(`延迟加载赞助列表：完成，用时 ${Math.round(performance.now() - sponsorLoadStart)}ms`);
            updateTimingInNotice('赞助列表加载完成', sponsorLoadStart);
          }
        });
      }
      console.log(`延迟加载非关键模块任务：赞助列表事件绑定完成，用时 ${Math.round(performance.now() - sponsorBindStart)}ms`);
      updateTimingInNotice('赞助列表事件绑定完成', sponsorBindStart);
      
      // 延迟加载关于页面
      const aboutBindStart = performance.now();
      console.log(`延迟加载非关键模块任务：开始关于页面事件绑定，用时 ${Math.round(aboutBindStart - nonCriticalInnerStart)}ms`);
      updateTimingInNotice('关于页面事件绑定开始', aboutBindStart);
      
      const aboutTab = document.querySelector('[href="#tab5"]');
      if (aboutTab) {
        aboutTab.addEventListener('click', () => {
          const aboutTabElement = document.getElementById('tab5');
          if (aboutTabElement && aboutTabElement.children.length === 1) {
            console.log('延迟加载关于页面：开始执行');
            const aboutLoadStart = performance.now();
            updateTimingInNotice('关于页面加载开始', aboutLoadStart);
            loadAbout();
            console.log(`延迟加载关于页面：完成，用时 ${Math.round(performance.now() - aboutLoadStart)}ms`);
            updateTimingInNotice('关于页面加载完成', aboutLoadStart);
          }
        });
      }
      console.log(`延迟加载非关键模块任务：关于页面事件绑定完成，用时 ${Math.round(performance.now() - aboutBindStart)}ms`);
      updateTimingInNotice('关于页面事件绑定完成', aboutBindStart);
      
      console.log(`延迟加载非关键模块任务：事件绑定全部完成，用时 ${Math.round(performance.now() - nonCriticalInnerStart)}ms`);
      updateTimingInNotice('延迟加载非关键模块完成', nonCriticalInnerStart);
    }, 1000);

    

  } catch (error) {
    console.error('初始化应用：出错：', error);
    const errorTime = performance.now();
    console.log(`initApp：初始化出错，用时 ${Math.round(errorTime - initStart)}ms`);
    updateStatus('初始化过程中出错', 100);
  } finally {
    const initEnd = performance.now();
    console.log(`initApp：函数执行完成，总耗时 ${Math.round(initEnd - initStart)}ms`);
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