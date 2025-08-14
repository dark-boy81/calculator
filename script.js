let currentDisplay = '0';
let previousDisplay = '';
let operation = null;
let resetScreen = false;

const display = document.getElementById('display');

function updateDisplay() {
    display.textContent = currentDisplay;
}

function appendToDisplay(value) {
    if (currentDisplay === '0' || resetScreen) {
        currentDisplay = '';
        resetScreen = false;
    }
    
    if (value === '.' && currentDisplay.includes('.')) return;
    
    currentDisplay += value;
    updateDisplay();
}

function clearDisplay() {
    currentDisplay = '0';
    previousDisplay = '';
    operation = null;
    updateDisplay();
}

function calculate() {
    let result;
    try {
        result = eval(currentDisplay);
    } catch (error) {
        result = 'Error';
    }
    
    currentDisplay = result.toString();
    updateDisplay();
    resetScreen = true;
}

// Handle keyboard input
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
        currentDisplay = currentDisplay.slice(0, -1);
        if (currentDisplay === '') currentDisplay = '0';
        updateDisplay();
    }
});

if (window.Telegram && window.Telegram.WebApp) {
    // Running in Telegram
    document.body.classList.add('telegram');
    Telegram.WebApp.expand();
}

// Initialize display

updateDisplay();
