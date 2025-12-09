// FXRatesAPI configuration
const API_KEY = 'fxr_live_fbff9a481c3f068ac79864fb23a33203184a';
const API_URL = 'https://api.fxratesapi.com/latest';

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const resultDisplay = document.getElementById('result');
const rateDisplay = document.getElementById('rate');
const infoBox = document.getElementById('infoBox');
const swapBtn = document.getElementById('swapBtn');

// Store exchange rates
let exchangeRates = {};
let lastUpdated = null;

// Fetch exchange rates
async function fetchExchangeRates() {
    try {
        infoBox.innerHTML = '<span class="loading">Loading exchange rates...</span>';
        
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        
        if (data.success) {
            exchangeRates = data.rates;
            lastUpdated = new Date(data.updated_at || Date.now());
            updateInfoBox();
            convertCurrency();
        } else {
            throw new Error('API returned unsuccessful response');
        }
    } catch (error) {
        console.error('Error fetching rates:', error);
        infoBox.innerHTML = '<span class="error">⚠️ Failed to load exchange rates. Please try again.</span>';
    }
}

// Update info box with last updated time
function updateInfoBox() {
    const timeString = lastUpdated.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    infoBox.innerHTML = `<span class="success">✓ Rates updated: ${timeString}</span>`;
}

// Convert currency
function convertCurrency() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    if (!exchangeRates[from] || !exchangeRates[to]) {
        resultDisplay.textContent = '0.00';
        rateDisplay.textContent = 'Exchange rate not available';
        return;
    }
    
    // Convert from base currency (USD) to target currencies
    const fromRate = exchangeRates[from];
    const toRate = exchangeRates[to];
    
    // Calculate conversion: amount in FROM currency -> USD -> TO currency
    const result = (amount / fromRate) * toRate;
    
    // Format result based on currency
    const formattedResult = formatCurrency(result, to);
    resultDisplay.textContent = formattedResult;
    
    // Display exchange rate
    const rate = toRate / fromRate;
    const formattedRate = rate.toFixed(6);
    rateDisplay.textContent = `1 ${from} = ${formattedRate} ${to}`;
}

// Format currency based on typical decimal places
function formatCurrency(amount, currency) {
    // Currencies that typically don't use decimal places
    const noDecimalCurrencies = ['JPY', 'KRW', 'CLP', 'IDR'];
    
    if (noDecimalCurrencies.includes(currency)) {
        return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    convertCurrency();
}

// Event listeners
amountInput.addEventListener('input', convertCurrency);
fromCurrency.addEventListener('change', convertCurrency);
toCurrency.addEventListener('change', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);

// Prevent negative numbers
amountInput.addEventListener('keydown', (e) => {
    if (e.key === '-' || e.key === 'e') {
        e.preventDefault();
    }
});

// Initial fetch
fetchExchangeRates();

// Refresh rates every 5 minutes
setInterval(fetchExchangeRates, 300000);