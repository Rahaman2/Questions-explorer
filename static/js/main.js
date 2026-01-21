// Store current suggestions and keyword
let currentSuggestions = [];
let currentKeyword = '';
let currentCategorizedData = null;

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
        currentCategorizedData = data.categorized || null;
        displayAllViews(currentSuggestions, currentKeyword, currentCategorizedData);
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
function displayAllViews(suggestions, keyword, categorizedData = null) {
    displayTableView(suggestions);
    displayVisualizationView(suggestions, keyword);

    // Use enhanced questions view if categorized data is available
    if (categorizedData && categorizedData.categories && categorizedData.metrics) {
        displayEnhancedQuestionsView(categorizedData);
    } else {
        displayQuestionsView(suggestions);
    }

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

// Display enhanced questions view with metrics dashboard and accordion
function displayEnhancedQuestionsView(categorizedData) {
    const metricsDashboard = document.getElementById('metrics-dashboard');
    const categoryAccordions = document.getElementById('category-accordions');

    if (!metricsDashboard || !categoryAccordions) {
        console.warn('Enhanced questions view containers not found');
        return;
    }

    // Clear existing content
    metricsDashboard.innerHTML = '';
    categoryAccordions.innerHTML = '';

    const { categories, metrics } = categorizedData;

    // Create metrics dashboard
    createMetricsDashboard(metrics, metricsDashboard);

    // Category metadata for icons and colors
    const categoryMetadata = {
        "Questions": { icon: "❓", color: "#667eea" },
        "Prepositions": { icon: "🔗", color: "#764ba2" },
        "Comparisons": { icon: "⚖️", color: "#f093fb" },
        "Intent_Based": { icon: "🎯", color: "#4facfe" },
        "Time_Related": { icon: "⏰", color: "#43e97b" },
        "Audience_Specific": { icon: "👥", color: "#fa709a" },
        "Problem_Solving": { icon: "🔧", color: "#30cfd0" },
        "Feature_Specific": { icon: "⚙️", color: "#a8edea" },
        "Opinions_Reviews": { icon: "⭐", color: "#ffd89b" },
        "Cost_Related": { icon: "💰", color: "#19547b" },
        "Trend_Based": { icon: "📈", color: "#f5af19" }
    };

    // Create accordion sections for each category
    Object.keys(categories).forEach(categoryName => {
        const suggestions = categories[categoryName];
        const categoryMetric = metrics[categoryName] || { count: 0, percentage: 0 };
        const metadata = categoryMetadata[categoryName] || { icon: "📋", color: "#667eea" };

        const accordionSection = createAccordionSection(
            categoryName,
            suggestions,
            categoryMetric,
            metadata,
            metrics.total
        );

        categoryAccordions.appendChild(accordionSection);
    });
}

// Create metrics dashboard
function createMetricsDashboard(metrics, container) {
    const categoryMetadata = {
        "Questions": { icon: "❓", color: "#667eea" },
        "Prepositions": { icon: "🔗", color: "#764ba2" },
        "Comparisons": { icon: "⚖️", color: "#f093fb" },
        "Intent_Based": { icon: "🎯", color: "#4facfe" },
        "Time_Related": { icon: "⏰", color: "#43e97b" },
        "Audience_Specific": { icon: "👥", color: "#fa709a" },
        "Problem_Solving": { icon: "🔧", color: "#30cfd0" },
        "Feature_Specific": { icon: "⚙️", color: "#a8edea" },
        "Opinions_Reviews": { icon: "⭐", color: "#ffd89b" },
        "Cost_Related": { icon: "💰", color: "#19547b" },
        "Trend_Based": { icon: "📈", color: "#f5af19" }
    };

    // Create metric cards for each category
    Object.keys(metrics).forEach(categoryName => {
        if (categoryName === 'total') return;

        const metric = metrics[categoryName];
        const metadata = categoryMetadata[categoryName] || { icon: "📋", color: "#667eea" };

        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        metricCard.style.borderLeftColor = metadata.color;

        metricCard.innerHTML = `
            <div class="metric-card-header">
                <span class="metric-icon">${metadata.icon}</span>
                <span class="metric-name">${formatCategoryName(categoryName)}</span>
            </div>
            <div class="metric-stats">
                <span class="metric-count">${metric.count}</span>
                <span class="metric-percentage">${metric.percentage}%</span>
            </div>
            <div class="metric-bar">
                <div class="metric-bar-fill" style="width: ${metric.percentage}%; background: ${metadata.color};"></div>
            </div>
        `;

        container.appendChild(metricCard);
    });
}

// Create single accordion section
function createAccordionSection(categoryName, suggestions, metric, metadata, totalCount) {
    const section = document.createElement('div');
    section.className = 'accordion-section';
    section.dataset.category = categoryName;

    const header = document.createElement('div');
    header.className = 'accordion-header';

    const percentage = totalCount > 0 ? ((suggestions.length / totalCount) * 100).toFixed(1) : 0;

    header.innerHTML = `
        <div class="accordion-header-left">
            <span class="accordion-icon">${metadata.icon}</span>
            <span class="accordion-title">${formatCategoryName(categoryName)}</span>
        </div>
        <div class="accordion-header-right">
            <div class="accordion-mini-bar">
                <div class="accordion-mini-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <span class="accordion-count">${metric.count}</span>
            <span class="accordion-expand-icon">▼</span>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'accordion-content';

    const contentInner = document.createElement('div');
    contentInner.className = 'accordion-content-inner';

    if (suggestions.length > 0) {
        const list = document.createElement('ul');
        list.className = 'category-suggestions-list';

        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'category-suggestion-item';
            li.textContent = suggestion;
            list.appendChild(li);
        });

        contentInner.appendChild(list);
    } else {
        contentInner.innerHTML = `
            <div class="empty-category">
                <div class="empty-category-icon">${metadata.icon}</div>
                <p>No suggestions found for this category</p>
            </div>
        `;
    }

    content.appendChild(contentInner);

    // Add click event to toggle accordion
    header.addEventListener('click', () => {
        const isExpanded = section.classList.contains('expanded');

        if (isExpanded) {
            section.classList.remove('expanded');
        } else {
            section.classList.add('expanded');
        }
    });

    section.appendChild(header);
    section.appendChild(content);

    return section;
}

// Format category name for display
function formatCategoryName(categoryName) {
    return categoryName.replace(/_/g, ' ');
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
