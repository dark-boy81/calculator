// Calculator State
let currentDisplay = '0';
let previousAnswer = null;
let operation = null;
let resetScreen = false;
let calculationHistory = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

// DOM Elements
const display = document.getElementById('display');
const historyDisplay = document.getElementById('historyDisplay');
const historyPanel = document.getElementById('historyPanel');
const historyItems = document.getElementById('historyItems');
const themeToggle = document.getElementById('themeToggle');
const historyToggle = document.getElementById('historyToggle');

// Initialize calculator
updateDisplay();
renderHistory();
setInitialTheme();

// Set initial theme based on preference
function setInitialTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
historyToggle.addEventListener('click', toggleHistoryPanel);

// Calculator Functions
function updateDisplay() {
    display.textContent = currentDisplay;
}

function appendToDisplay(value) {
    // If we have a previous answer and user presses an operator
    if (previousAnswer !== null && ['+', '-', '*', '/'].includes(value)) {
        currentDisplay = previousAnswer + value;
        previousAnswer = null;
        resetScreen = false;
        updateDisplay();
        return;
    }
    
    if (currentDisplay === '0' || resetScreen) {
        currentDisplay = '';
        resetScreen = false;
    }
    
    // Prevent multiple decimals
    if (value === '.' && currentDisplay.includes('.')) return;
    
    // Prevent operators at start (except minus for negative numbers)
    if (['+', '*', '/', ')'].includes(value) && currentDisplay === '') return;
    
    // Handle negative numbers
    if (value === '-' && currentDisplay === '-') return;
    
    currentDisplay += value;
    updateDisplay();
}

function deleteLastChar() {
    if (currentDisplay.length === 1) {
        currentDisplay = '0';
    } else {
        currentDisplay = currentDisplay.slice(0, -1);
    }
    updateDisplay();
}

function clearDisplay() {
    currentDisplay = '0';
    previousAnswer = null;
    operation = null;
    updateDisplay();
    historyDisplay.textContent = '';
}

function calculate() {
    // Check for empty expression
    if (currentDisplay === '') {
        showError('Invalid expression');
        return;
    }
    
    // Check for unbalanced parentheses
    const openParens = (currentDisplay.match(/\(/g) || []).length;
    const closeParens = (currentDisplay.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
        showError('Unbalanced parentheses');
        return;
    }
    
    // Check for trailing operator
    if (['+', '-', '*', '/', '('].includes(currentDisplay.slice(-1))) {
        showError('Invalid expression');
        return;
    }
    
    let result;
    try {
        // Replace × with * for evaluation
        const expression = currentDisplay.replace(/×/g, '*');
        result = eval(expression);
        
        // Handle division by zero
        if (!isFinite(result)) {
            throw new Error('Division by zero');
        }
        
        // Format result
        result = parseFloat(result.toFixed(10)).toString();
        
        // Store the answer for future operations
        previousAnswer = result;
        
        // Add to history
        addToHistory(currentDisplay, result);
        
        // Update displays
        historyDisplay.textContent = currentDisplay + ' =';
        currentDisplay = result;
        updateDisplay();
        resetScreen = true;
    } catch (error) {
        showError('Calculation error');
    }
}

function showError(message) {
    display.textContent = message;
    display.classList.add('error-animation');
    
    setTimeout(() => {
        display.classList.remove('error-animation');
        updateDisplay();
    }, 1000);
}

// History Functions
function addToHistory(expression, result) {
    calculationHistory.unshift({
        expression,
        result,
        timestamp: new Date().toLocaleString()
    });
    
    // Keep only last 20 items
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    
    // Update history display
    renderHistory();
}

function renderHistory() {
    historyItems.innerHTML = '';
    
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            currentDisplay = item.expression;
            previousAnswer = item.result;
            updateDisplay();
            toggleHistoryPanel();
        });
        
        historyItems.appendChild(historyItem);
    });
}

function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('calculatorHistory');
    renderHistory();
}

// Theme Functions
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Panel Functions
function toggleHistoryPanel() {
    historyPanel.classList.toggle('active');
    // Close keyboard on mobile when history opens
    if (historyPanel.classList.contains('active')) {
        display.blur();
    }
}

// Keyboard Support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if ((key >= '0' && key <= '9') || key === '.') {
        appendToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLastChar();
    } else if (key === '(' || key === ')') {
        appendToDisplay(key);
    }
});

// Close history panel when clicking outside
document.addEventListener('click', (event) => {
    if (!historyPanel.contains(event.target) && 
        event.target !== historyToggle && 
        !historyToggle.contains(event.target)) {
        historyPanel.classList.remove('active');
    }
});

// Telegram Web App detection
if (window.Telegram && window.Telegram.WebApp) {
    document.body.classList.add('telegram');
    Telegram.WebApp.expand();
    
    // Adjust for Telegram's header
    document.documentElement.style.setProperty('--tg-header-height', '60px');
    document.body.style.paddingTop = 'var(--tg-header-height)';
}
