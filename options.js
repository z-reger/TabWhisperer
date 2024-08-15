document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadThresholds();

    document.getElementById('add-category-btn').addEventListener('click', () => {
        const categoryName = document.getElementById('new-category-name').value;
        addCategory(categoryName);
    });

    document.getElementById('save-thresholds-btn').addEventListener('click', () => {
        saveThresholds();
    });
});

function loadCategories() {
    chrome.storage.sync.get(['categories'], (result) => {
        const categoryList = document.getElementById('category-list');
        for (let category in result.categories) {
            const listItem = document.createElement('li');
            listItem.textContent = category;
            categoryList.appendChild(listItem);
        }
    });
}

function addCategory(categoryName) {
    chrome.storage.sync.get(['categories'], (result) => {
        if (categoryName && !result.categories[categoryName]) {
            result.categories[categoryName] = [];
            chrome.storage.sync.set({ categories: result.categories }, () => {
                loadCategories();
                document.getElementById('new-category-name').value = '';
            });
        }
    });
}

function loadThresholds() {
    chrome.storage.sync.get(['inactivityThreshold', 'reminderThreshold'], (result) => {
        document.getElementById('inactivity-threshold').value = result.inactivityThreshold || 30;
        document.getElementById('reminder-threshold').value = result.reminderThreshold || 1440;
    });
}

function saveThresholds() {
    const inactivityThreshold = parseInt(document.getElementById('inactivity-threshold').value);
    const reminderThreshold = parseInt(document.getElementById('reminder-threshold').value);

    chrome.storage.sync.set({
        inactivityThreshold,
        reminderThreshold
    }, () => {
        alert('Thresholds saved successfully!');
    });
}
