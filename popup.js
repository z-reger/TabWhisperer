document.addEventListener('DOMContentLoaded', () => {
    loadUrgentTabs();
    loadCategories();

    document.getElementById('save-session').addEventListener('click', () => {
        saveSession();
    });

    document.getElementById('restore-session').addEventListener('click', () => {
        restoreSession();
    });

    document.getElementById('categorize-btn').addEventListener('click', () => {
        const selectedCategory = document.getElementById('category-select').value;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            categorizeTab(activeTab, selectedCategory);
        });
    });
});


function loadUrgentTabs() {
    chrome.storage.sync.get(['tabs'], (result) => {
        if (result.tabs && Array.isArray(result.tabs)) {
            const urgentTabs = result.tabs.filter(tab => tab.urgency >= 8);
            const urgentList = document.getElementById('urgent-list');
            urgentTabs.forEach(tab => {
                const listItem = document.createElement('li');
                listItem.textContent = tab.title;
                urgentList.appendChild(listItem);
            });
        } else {
            console.error('No tabs found or tabs data is not an array');
        }
    });
}


function loadCategories() {
    chrome.storage.sync.get(['categories'], (result) => {
        const categorySelect = document.getElementById('category-select');
        for (let category in result.categories) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        }
    });
}

function saveSession() {
    const sessionName = prompt("Enter a name for this session:");
    chrome.storage.sync.get(['tabs'], (result) => {
        const sessionData = { sessionName, tabs: result.tabs };
        chrome.storage.sync.set({ sessionData });
        alert("Session saved!");
    });
}


function restoreSession() {
    chrome.storage.sync.get(['sessionData'], (result) => {
        if (result.sessionData && result.sessionData.tabs && Array.isArray(result.sessionData.tabs)) {
            chrome.windows.create({ url: result.sessionData.tabs.map(tab => tab.url) });
        } else {
            alert("No session data found.");
        }
    });
}

function categorizeTab(tab, category) {
    chrome.storage.sync.get(['categories'], (result) => {
        if (result.categories[category]) {
            result.categories[category].push(tab);
            chrome.storage.sync.set({ categories: result.categories });
            alert("Tab categorized under " + category);
        }
    });
}
