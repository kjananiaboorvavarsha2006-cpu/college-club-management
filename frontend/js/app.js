// Common JavaScript functions for all pages

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    
    return { token, user };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === 'success' ? 'bg-green-50 text-green-800' : 
        type === 'error' ? 'bg-red-50 text-red-800' : 
        'bg-blue-50 text-blue-800'
    }`;
    
    notification.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle'
                }"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button class="inline-flex rounded-md p-1.5 ${
                        type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100' : 
                        type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 
                        'bg-blue-50 text-blue-500 hover:bg-blue-100'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span class="sr-only">Dismiss</span>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Dismiss on click
    notification.querySelector('button').addEventListener('click', function() {
        notification.remove();
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

// Setup user menu
function setupUserMenu() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', function() {
            userMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
}

// Setup logout buttons
function setupLogoutButtons() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', logout);
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupUserMenu();
    setupLogoutButtons();
});