chrome.runtime.onInstalled.addListener(() => {
    initializeExtension();
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      categorizeTab(tab);
      determineUrgency(tab);
    }
  });
  
  setInterval(() => {
    monitorInactivity();
  }, 60000);
  
  function initializeExtension() {
    chrome.storage.sync.get(['categories', 'inactivityThreshold', 'reminderThreshold', 'groupingRules'], (result) => {
      if (!result.categories) {
        chrome.storage.sync.set({
          categories: { "Work": [], "Entertainment": [], "Research": [], "Shopping": [] }
        });
      }
      if (!result.inactivityThreshold) {
        chrome.storage.sync.set({ inactivityThreshold: 30 });
      }
      if (!result.reminderThreshold) {
        chrome.storage.sync.set({ reminderThreshold: 1440 });
      }
      if (!result.groupingRules) {
        chrome.storage.sync.set({ groupingRules: {} });
      }
    });
  }
  
  function categorizeTab(tab) {
    chrome.storage.sync.get(['categories', 'groupingRules'], (result) => {
      let category = applyGroupingRules(tab, result.groupingRules);
      if (category) {
        result.categories[category].push(tab);
        chrome.storage.sync.set({ categories: result.categories });
      }
    });
  }
  
  function determineUrgency(tab) {
    const now = new Date().getTime();
    const lastActive = tab.lastAccessed || now;
    const timeInactive = (now - lastActive) / 60000;
  
    chrome.storage.sync.get('inactivityThreshold', (result) => {
      if (timeInactive > result.inactivityThreshold) {
        triggerReminder(tab);
      }
    });
  }
  
  function monitorInactivity() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        determineUrgency(tab);
      });
    });
  }
  
  function triggerReminder(tab) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Tab Whisperer Reminder',
      message: `You haven't interacted with this tab: ${tab.title}`,
      buttons: [{ title: 'Bookmark' }, { title: 'Close' }],
      priority: 0
    }, (notificationId) => {
      chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
        if (id === notificationId) {
          if (buttonIndex === 0) {
            chrome.bookmarks.create({ title: tab.title, url: tab.url });
          } else if (buttonIndex === 1) {
            closeTab(tab.id);
          }
        }
      });
    });
  }
  
  function applyGroupingRules(tab, groupingRules) {
    for (let category in groupingRules) {
      const rules = groupingRules[category];
      for (let rule of rules) {
        if (tab.url.includes(rule)) {
          return category;
        }
      }
    }
    return null;
  }
  
  function closeTab(tabId) {
    chrome.tabs.remove(tabId);
  }
  