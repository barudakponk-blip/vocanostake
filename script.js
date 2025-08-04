// Simulated database
const database = {
    users: [],
    deposits: [],
    portfolios: {}
};

// Current user state
let currentUser = null;
let userPortfolio = {
    balances: {
        btc: { total: 0, staked: 0, available: 0, value: 0 },
        eth: { total: 0, staked: 0, available: 0, value: 0 },
        sol: { total: 0, staked: 0, available: 0, value: 0 },
        usdt: { total: 0, staked: 0, available: 0, value: 0 },
        usdc: { total: 0, staked: 0, available: 0, value: 0 }
    },
    totalValue: 0
};

// DOM Elements
const authSection = document.getElementById('auth-section');
const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const dashboardSection = document.getElementById('dashboard-section');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const switchToLogin = document.getElementById('switch-to-login');
const switchToRegister = document.getElementById('switch-to-register');
const authBtn = document.getElementById('auth-btn');
const assetsTableBody = document.getElementById('assets-table-body');
const totalBalanceEl = document.getElementById('total-balance');
const stakedBalanceEl = document.getElementById('staked-balance');
const availableBalanceEl = document.getElementById('available-balance');
const generateAddressBtn = document.getElementById('generate-address-btn');
const addressSection = document.getElementById('address-section');
const depositAddress = document.getElementById('deposit-address');
const copyAddressBtn = document.getElementById('copy-address-btn');
const checkBalanceBtn = document.getElementById('check-balance-btn');
const coinSelect = document.getElementById('coin-select');
const depositAmount = document.getElementById('deposit-amount');

// Coin data
const coins = {
    btc: { name: 'Bitcoin', symbol: 'BTC', currentPrice: 50000.00 },
    eth: { name: 'Ethereum', symbol: 'ETH', currentPrice: 3000.00 },
    sol: { name: 'Solana', symbol: 'SOL', currentPrice: 100.00 },
    usdt: { name: 'Tether', symbol: 'USDT', currentPrice: 1.00 },
    usdc: { name: 'USD Coin', symbol: 'USDC', currentPrice: 1.00 }
};

// Event Listeners
registerBtn.addEventListener('click', handleRegister);
loginBtn.addEventListener('click', handleLogin);
switchToLogin.addEventListener('click', () => toggleAuthForms('login'));
switchToRegister.addEventListener('click', () => toggleAuthForms('register'));
authBtn.addEventListener('click', handleLogout);
generateAddressBtn.addEventListener('click', generateDepositAddress);
copyAddressBtn.addEventListener('click', copyAddress);
checkBalanceBtn.addEventListener('click', checkBalance);

// Functions
function toggleAuthForms(form) {
    if (form === 'login') {
        registrationForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    } else {
        loginForm.classList.add('hidden');
        registrationForm.classList.remove('hidden');
    }
}

function handleRegister() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Check if user already exists
    const userExists = database.users.some(user => user.email === email);
    if (userExists) {
        alert('User with this email already exists');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In a real app, passwords should be hashed
        createdAt: new Date().toISOString()
    };

    database.users.push(newUser);
    database.portfolios[newUser.id] = JSON.parse(JSON.stringify(userPortfolio));

    currentUser = newUser;
    alert('Registration successful! Welcome to CryptoStake.');
    showDashboard();
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = database.users.find(user => user.email === email && user.password === password);
    if (!user) {
        alert('Invalid email or password');
        return;
    }

    currentUser = user;
    userPortfolio = database.portfolios[user.id] || JSON.parse(JSON.stringify(userPortfolio));
    showDashboard();
}

function handleLogout() {
    if (!currentUser) {
        // Show login form if not logged in
        toggleAuthForms('login');
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        return;
    }

    currentUser = null;
    authBtn.textContent = 'Sign In';
    toggleAuthForms('register');
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    authBtn.textContent = 'Logout';

    // Update portfolio display
    updatePortfolio();
}

function updatePortfolio() {
    if (!currentUser) return;

    // Calculate totals
    const totalStaked = Object.entries(userPortfolio.balances).reduce((sum, [coinId, coinData]) => sum + coinData.staked * coins[coinId].currentPrice, 0);
    const totalAvailable = Object.entries(userPortfolio.balances).reduce((sum, [coinId, coinData]) => sum + coinData.available * coins[coinId].currentPrice, 0);
    const totalValue = totalStaked + totalAvailable;

    // Update summary cards
    totalBalanceEl.textContent = `$${totalValue.toFixed(2)}`;
    stakedBalanceEl.textContent = `$${totalStaked.toFixed(2)}`;
    availableBalanceEl.textContent = `$${totalAvailable.toFixed(2)}`;

    // Update assets table
    assetsTableBody.innerHTML = '';
    
    for (const [coinId, coinData] of Object.entries(userPortfolio.balances)) {
        if (coins[coinId] && (coinData.total > 0 || coinData.staked > 0)) {
            const coinInfo = coins[coinId];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img src="https://placehold.co/40x40" alt="${coinInfo.name} logo with ${coinInfo.symbol} symbol" class="h-10 w-10 rounded-full">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${coinInfo.name}</div>
                            <div class="text-sm text-gray-500">${coinInfo.symbol}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${coinData.total.toFixed(8)}</div>
                    <div class="text-sm text-gray-500">$${(coinData.total * coinInfo.currentPrice).toFixed(2)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $${(coinData.total * coinInfo.currentPrice).toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${coinData.staked.toFixed(8)} ($${(coinData.staked * coinInfo.currentPrice).toFixed(2)})
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 stake-btn" data-coin="${coinId}">Stake</button>
                    <button class="ml-2 text-green-600 hover:text-green-900 unstake-btn" data-coin="${coinId}">Unstake</button>
                </td>
            `;
            
            assetsTableBody.appendChild(row);
        }
    }
    
    // Add event listeners to stake/unstake buttons
    document.querySelectorAll('.stake-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleStake(e.target.dataset.coin));
    });
    
    document.querySelectorAll('.unstake-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleUnstake(e.target.dataset.coin));
    });
}

function generateDepositAddress() {
    const coin = coinSelect.value;
    const amount = parseFloat(depositAmount.value);
    
    if (!coin || isNaN(amount) || amount <= 0) {
        alert('Please select a coin and enter a valid amount');
        return;
    }
    
    // Generate a fake deposit address (in a real app this would come from your backend)
    const address = `3FZbgi29cpjq2GjdwV8eyHJJ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    depositAddress.value = address;
    addressSection.classList.remove('hidden');
    checkBalanceBtn.classList.remove('hidden');
}

function copyAddress() {
    depositAddress.select();
    document.execCommand('copy');
    alert('Address copied to clipboard!');
}

function checkBalance() {
    const coin = coinSelect.value;
    const amount = parseFloat(depositAmount.value);
    
    // Simulate deposit confirmation
    if (currentUser && coin && !isNaN(amount) && amount > 0) {
        // Record the deposit
        database.deposits.push({
            userId: currentUser.id,
            coin,
            amount,
            address: depositAddress.value,
            timestamp: new Date().toISOString()
        });
        
        // Update portfolio
        userPortfolio.balances[coin].total += amount;
        userPortfolio.balances[coin].available += amount;
        
        // Save to "database"
        database.portfolios[currentUser.id] = userPortfolio;
        
        // Update UI
        updatePortfolio();
        alert(`Success! You've deposited ${amount} ${coin.toUpperCase()}`);
        
        // Reset form
        addressSection.classList.add('hidden');
        checkBalanceBtn.classList.add('hidden');
        depositAddress.value = '';
        depositAmount.value = '';
    }
}

function handleStake(coin) {
    const amount = parseFloat(prompt(`How much ${coin.toUpperCase()} would you like to stake?`, '0'));
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > userPortfolio.balances[coin].available) {
        alert('You don\'t have enough available balance');
        return;
    }
    
    userPortfolio.balances[coin].available -= amount;
    userPortfolio.balances[coin].staked += amount;
    
    // Save to "database"
    database.portfolios[currentUser.id] = userPortfolio;
    
    updatePortfolio();
    alert(`Successfully staked ${amount} ${coin.toUpperCase()}`);
}

function handleUnstake(coin) {
    const amount = parseFloat(prompt(`How much ${coin.toUpperCase()} would you like to unstake?`, '0'));
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > userPortfolio.balances[coin].staked) {
        alert('You don\'t have that much staked');
        return;
    }
    
    userPortfolio.balances[coin].staked -= amount;
    userPortfolio.balances[coin].available += amount;
    
    // Save to "database"
    database.portfolios[currentUser.id] = userPortfolio;
    
    updatePortfolio();
    alert(`Successfully unstaked ${amount} ${coin.toUpperCase()}`);
}