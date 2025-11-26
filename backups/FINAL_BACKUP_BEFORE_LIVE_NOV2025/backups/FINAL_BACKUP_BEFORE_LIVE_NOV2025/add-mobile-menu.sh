#!/bin/bash

# Script to add mobile menu elements to HTML files with sidebars

# List of files to update (pages with sidebars)
FILES=(
    "loads.html"
    "drivers.html"
    "fleet.html"
    "customers.html"
    "invoices.html"
    "settlements.html"
    "reports.html"
    "import.html"
    "settings.html"
    "ifta.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Check if mobile menu already exists
        if grep -q "mobile-menu-toggle" "$file"; then
            echo "  - Mobile menu already exists, skipping..."
            continue
        fi
        
        # Add mobile menu elements after <body> tag
        # This is a simplified approach - in production you'd use a more robust method
        sed -i.bak '/<body>/a\
    <!-- Mobile Menu Toggle -->\
    <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle Menu">\
        <i class="fas fa-bars"></i>\
    </button>\
    \
    <!-- Mobile Sidebar Overlay -->\
    <div class="sidebar-overlay" onclick="closeMobileMenu()"></div>' "$file"
        
        # Update sidebar div to have id
        sed -i.bak 's/<div class="sidebar">/<div class="sidebar" id="sidebar">/' "$file"
        
        # Add mobile-menu.js script reference after main.js
        sed -i.bak 's|<script src="main.js"></script>|<script src="main.js"></script>\
    <script src="mobile-menu.js"></script>|' "$file"
        
        echo "  - Updated successfully!"
    else
        echo "  - File not found, skipping..."
    fi
done

echo "Done! Backup files created with .bak extension"
