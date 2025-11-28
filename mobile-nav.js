/**
 * Mobile Navigation Component for ATS FREIGHT TMS
 * Adds hamburger menu to all pages with top navigation
 * Version: 1.0.0
 */

const MobileNav = {
    initialized: false,

    init: function () {
        if (this.initialized) return;

        this.createMobileMenuButton();
        this.createMobileDrawer();
        this.setupEventListeners();
        this.initialized = true;
        console.log('[MobileNav] Initialized');
    },

    createMobileMenuButton: function () {
        if (document.getElementById('mobileMenuBtn')) return;

        const nav = document.querySelector('nav');
        if (!nav) return;

        const menuBtn = document.createElement('button');
        menuBtn.id = 'mobileMenuBtn';
        menuBtn.className = 'lg:hidden fixed top-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg';
        menuBtn.setAttribute('aria-label', 'Open menu');
        menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';

        document.body.appendChild(menuBtn);
    },

    createMobileDrawer: function () {
        if (document.getElementById('mobileDrawer')) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        const navItems = [
            { href: 'index.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
            { href: 'loads.html', icon: 'fa-truck', label: 'Loads' },
            { href: 'drivers.html', icon: 'fa-users', label: 'Drivers' },
            { href: 'settlements.html', icon: 'fa-calculator', label: 'Settlements' },
            { href: 'dispatch.html', icon: 'fa-calendar-alt', label: 'Dispatch' },
            { href: 'fleet.html', icon: 'fa-truck-moving', label: 'Fleet' },
            { href: 'expenses.html', icon: 'fa-receipt', label: 'Expenses' },
            { href: 'invoices.html', icon: 'fa-file-invoice-dollar', label: 'Invoices' },
            { href: 'customers.html', icon: 'fa-building', label: 'Customers' },
            { href: 'reports.html', icon: 'fa-chart-bar', label: 'Reports' },
            { href: 'accounts-receivable.html', icon: 'fa-money-check-alt', label: 'AR & Aging' },
            { href: 'settings.html', icon: 'fa-cog', label: 'Settings' }
        ];

        const overlay = document.createElement('div');
        overlay.id = 'mobileDrawerOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity duration-300 opacity-0';

        const drawer = document.createElement('div');
        drawer.id = 'mobileDrawer';
        drawer.className = 'fixed top-0 right-0 h-full w-72 bg-gray-900 text-white z-50 transform translate-x-full transition-transform duration-300 overflow-y-auto';

        let drawerHTML = `
            <div class="p-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold">ATS FREIGHT LLC</h2>
                    <p class="text-xs text-gray-400">TMS Menu</p>
                </div>
                <button id="closeDrawerBtn" class="p-2 hover:bg-gray-700 rounded" aria-label="Close menu">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <nav class="p-4">
                <ul class="space-y-2">
        `;

        navItems.forEach(item => {
            const isActive = currentPage === item.href;
            const activeClass = isActive ? 'bg-blue-600' : 'hover:bg-gray-700';
            drawerHTML += `
                <li>
                    <a href="${item.href}" class="flex items-center gap-3 px-4 py-3 rounded-lg ${activeClass} transition-colors">
                        <i class="fas ${item.icon} w-5 text-center"></i>
                        <span>${item.label}</span>
                    </a>
                </li>
            `;
        });

        drawerHTML += `
                </ul>
            </nav>
            <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                <button onclick="if(typeof Auth !== 'undefined') Auth.signOut(); else window.location.href='login.html';" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        `;

        drawer.innerHTML = drawerHTML;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
    },

    setupEventListeners: function () {
        const self = this; // Store reference for event handlers

        // Menu button click
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.openDrawer();
            });
        }

        // Close button click
        const closeBtn = document.getElementById('closeDrawerBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.closeDrawer();
            });
        }

        // Overlay click - THIS IS THE FIX
        const overlay = document.getElementById('mobileDrawerOverlay');
        if (overlay) {
            overlay.addEventListener('click', function (e) {
                e.preventDefault();
                self.closeDrawer();
            });
        }

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                self.closeDrawer();
            }
        });

        // Close on resize to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1024) {
                self.closeDrawer();
            }
        });
    },

    openDrawer: function () {
        const drawer = document.getElementById('mobileDrawer');
        const overlay = document.getElementById('mobileDrawerOverlay');

        if (drawer) {
            drawer.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        }
        if (overlay) {
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('opacity-100'), 10);
        }
    },

    closeDrawer: function () {
        const drawer = document.getElementById('mobileDrawer');
        const overlay = document.getElementById('mobileDrawerOverlay');

        if (drawer) {
            drawer.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }
        if (overlay) {
            overlay.classList.remove('opacity-100');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MobileNav.init();
});

window.MobileNav = MobileNav;
