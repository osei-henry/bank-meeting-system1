// DOM Elements
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const navItems = document.querySelectorAll('.nav-item');
const pageContents = document.querySelectorAll('.page-content');
const logoutBtn = document.getElementById('logout-btn');
const pageTitle = document.getElementById('page-title');
const createMeetingBtn = document.getElementById('create-meeting-btn');
const qrModal = document.getElementById('qr-modal');
const closeModalBtn = document.querySelector('.close-modal');


// Demo login credentials
const DEMO_EMAIL = 'ghansah.henry@myumbbank.com';
const DEMO_PASSWORD = 'Windows@@055020';

// Login Functionality
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Demo validation
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        // Show success message
        alert('Login successful! Welcome to Bank Meeting System.');
        
        // Switch to dashboard
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
        
        // Reset form
        loginForm.reset();
    } else {
        alert('Invalid credentials. Use: admin@bank.com / password123');
    }
});

// Navigation Functionality
navItems.forEach(item => {
    if (!item.id) { // Skip logout button
        item.addEventListener('click', function() {
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Get page to show
            const page = this.getAttribute('data-page');
            
            // Update page title
            const pageTitles = {
                'dashboard': 'Dashboard',
                'meetings': 'Meetings',
                'attendees': 'Attendees',
                'departments': 'Departments',
                'admins': 'Admins'
            };
            pageTitle.textContent = pageTitles[page];
            
            // Show corresponding content
            pageContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${page}-content`) {
                    content.classList.remove('hidden');
                }
            });
        });
    }
});

// Logout Functionality
logoutBtn.addEventListener('click', function() {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to logout?')) {
        dashboardPage.classList.remove('active');
        loginPage.classList.add('active');
        
        // Reset navigation
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelector('.nav-item[data-page="dashboard"]').classList.add('active');
        pageTitle.textContent = 'Dashboard';
        pageContents.forEach(content => {
            content.classList.add('hidden');
            if (content.id === 'dashboard-content') {
                content.classList.remove('hidden');
            }
        });
    }
});

// QR Modal Functionality
createMeetingBtn.addEventListener('click', function() {
    qrModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', function() {
    qrModal.classList.add('hidden');
});

// Close modal when clicking outside
qrModal.addEventListener('click', function(e) {
    if (e.target === qrModal) {
        qrModal.classList.add('hidden');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
        qrModal.classList.add('hidden');
    }
});

// Demo data updates (simulating real data)
function updateStats() {
    // This would normally fetch from an API
    const stats = {
        meetings: Math.floor(Math.random() * 10) + 1,
        attendees: Math.floor(Math.random() * 100) + 20,
        departments: Math.floor(Math.random() * 5) + 1,
        admins: Math.floor(Math.random() * 3) + 1
    };
    
    document.querySelectorAll('.stat-info h3').forEach((stat, index) => {
        const values = Object.values(stats);
        if (values[index]) {
            stat.textContent = values[index];
        }
    });
}

// Update stats every 10 seconds to simulate live data
setInterval(updateStats, 10000);

// Initialize
updateStats();
console.log('Bank Meeting System loaded successfully!');