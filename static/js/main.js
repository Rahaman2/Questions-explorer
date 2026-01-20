// Store current suggestions and keyword
let currentSuggestions = [];
let currentKeyword = '';

// DOM elements
const keywordForm = document.getElementById('keyword-form');
const keywordInput = document.getElementById('keyword-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results-section');
const resultsBody = document.getElementById('results-body');
const resultCount = document.getElementById('result-count');
const copyBtn = document.getElementById('copy-btn');
const exportBtn = document.getElementById('export-btn');

// View elements
const tabBtns = document.querySelectorAll('.tab-btn');
const viewContents = document.querySelectorAll('.view-content');

// Initialize tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        switchView(viewName);
    });
});

// Form submission handler
keywordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const keyword = keywordInput.value.trim();

    if (!keyword) {
        showError('Please enter a keyword');
        return;
    }

    currentKeyword = keyword;

    // Reset UI
    hideError();
    hideResults();
    showLoading();
    disableSearch();

    try {
        const response = await fetch('/api/keywords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch suggestions');
        }

        currentSuggestions = data.suggestions;
        displayAllViews(currentSuggestions, currentKeyword);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
        enableSearch();
    }
});

// Copy to clipboard handler
copyBtn.addEventListener('click', async () => {
    if (currentSuggestions.length === 0) {
        showError('No suggestions to copy');
        return;
    }

    try {
        // Generate CSV format for clipboard
        const csvText = 'Keyword Suggestion\n' + currentSuggestions.join('\n');

        await navigator.clipboard.writeText(csvText);

        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#10b981';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
});

// Export CSV handler
exportBtn.addEventListener('click', async () => {
    if (currentSuggestions.length === 0) {
        showError('No suggestions to export');
        return;
    }

    try {
        const response = await fetch('/api/export-csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ suggestions: currentSuggestions }),
        });

        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keyword_suggestions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show success feedback
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Downloaded!';
        exportBtn.style.background = '#10b981';

        setTimeout(() => {
            exportBtn.textContent = originalText;
            exportBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showError('Failed to export CSV');
    }
});

// Switch between views
function switchView(viewName) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update view contents
    viewContents.forEach(view => {
        if (view.id === `${viewName}-view`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
}

// Display all views
function displayAllViews(suggestions, keyword) {
    displayTableView(suggestions);
    displayVisualizationView(suggestions, keyword);
    displayQuestionsView(suggestions);

    resultCount.textContent = suggestions.length;
    showResults();
}

// Display table view
function displayTableView(suggestions) {
    resultsBody.innerHTML = '';

    suggestions.forEach((suggestion, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(suggestion)}</td>
        `;
        resultsBody.appendChild(row);
    });
}

// Display visualization view (tree)
function displayVisualizationView(suggestions, keyword) {
    const centerKeyword = document.getElementById('center-keyword');
    const treeBranches = document.getElementById('tree-branches');

    centerKeyword.textContent = keyword;
    treeBranches.innerHTML = '';

    // Display suggestions as branches
    suggestions.forEach(suggestion => {
        const branch = document.createElement('div');
        branch.className = 'branch';
        branch.innerHTML = `<div class="branch-text">${escapeHtml(suggestion)}</div>`;
        treeBranches.appendChild(branch);
    });
}

// Display questions view
function displayQuestionsView(suggestions) {
    // Group suggestions by question type
    const questionGroups = {
        what: [],
        how: [],
        why: [],
        where: [],
        when: [],
        who: [],
        which: [],
        are: []
    };

    suggestions.forEach(suggestion => {
        const lower = suggestion.toLowerCase();
        if (lower.includes('what ') || lower.startsWith('what')) {
            questionGroups.what.push(suggestion);
        } else if (lower.includes('how ') || lower.startsWith('how')) {
            questionGroups.how.push(suggestion);
        } else if (lower.includes('why ') || lower.startsWith('why')) {
            questionGroups.why.push(suggestion);
        } else if (lower.includes('where ') || lower.startsWith('where')) {
            questionGroups.where.push(suggestion);
        } else if (lower.includes('when ') || lower.startsWith('when')) {
            questionGroups.when.push(suggestion);
        } else if (lower.includes('who ') || lower.startsWith('who')) {
            questionGroups.who.push(suggestion);
        } else if (lower.includes('which ') || lower.startsWith('which')) {
            questionGroups.which.push(suggestion);
        } else if (lower.includes('are ') || lower.startsWith('are')) {
            questionGroups.are.push(suggestion);
        }
    });

    // Populate each question category
    Object.keys(questionGroups).forEach(type => {
        const categoryDiv = document.getElementById(`${type}-questions`);
        const listElement = categoryDiv.querySelector('.question-list');

        listElement.innerHTML = '';

        if (questionGroups[type].length > 0) {
            categoryDiv.classList.remove('empty');
            listElement.classList.remove('empty');
            questionGroups[type].forEach(question => {
                const li = document.createElement('li');
                li.textContent = question;
                listElement.appendChild(li);
            });
        } else {
            categoryDiv.classList.add('empty');
            listElement.classList.add('empty');
        }
    });
}

// Utility functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showResults() {
    resultsSection.style.display = 'block';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function disableSearch() {
    searchBtn.disabled = true;
}

function enableSearch() {
    searchBtn.disabled = false;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
