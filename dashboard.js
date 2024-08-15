document.addEventListener('DOMContentLoaded', () => {
    loadTabs();
        // Add event delegation to handle close button clicks
        document.getElementById('tabs-list').addEventListener('click', function(e) {
            if (e.target && e.target.tagName === 'BUTTON') {
                const tabId = e.target.getAttribute('data-tab-id');
                console.log("Closing tab with ID:", tabId); // Debugging log
                closeTab(parseInt(tabId, 10));
            }
        });
});

function loadTabs() {
    chrome.storage.sync.get(['categories'], (result) => {
        const tabsList = document.getElementById('tabs-list');
        for (let category in result.categories) {
            result.categories[category].forEach(tab => {
                const listItem = document.createElement('li');
                listItem.textContent = `${tab.title} - ${category}`;
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.addEventListener('click', () => closeTab(tab.id));
                listItem.appendChild(closeButton);
                tabsList.appendChild(listItem);
            });
        }
    });
}

function closeTab(tabId) {
    if (typeof tabId === 'number' && !isNaN(tabId)) {
        chrome.tabs.remove(tabId, () => {
            loadTabs(); // Refresh the list after closing a tab
        });
    } else {
        console.error('Invalid tabId:', tabId);
    }
}

