# ATS FREIGHT TMS - Mobile Testing Checklist

## Quick Test (5 minutes)

Run through this checklist after any changes to verify mobile responsiveness.

### Device Simulation

- [ ] Open Chrome DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test at: iPhone SE (375px), iPhone 12 (390px), iPad (768px)

### Navigation

- [ ] Hamburger menu visible on mobile
- [ ] Drawer opens and closes
- [ ] All navigation links work
- [ ] Logo visible in header

### Core Pages

- [ ] Dashboard: Stats cards stack, charts visible
- [ ] Loads: Table scrolls, "Add Load" modal works
- [ ] Drivers: Table scrolls, "Add Driver" modal works
- [ ] Settlements: Full flow works on mobile

### Forms & Modals

- [ ] Modals go full-screen on mobile
- [ ] Form fields are 48px+ height
- [ ] Buttons are full-width
- [ ] Can submit forms successfully

### Tables

- [ ] All tables scroll horizontally
- [ ] "← Scroll →" hint appears
- [ ] Action buttons are tappable (44px+)

---

## Full Test (30 minutes)

### All Pages Checklist

| Page | Loads? | Nav Works? | Content Readable? | Forms Work? | No Overflow? |
|------|--------|------------|-------------------|-------------|--------------|
| Dashboard | ☐ | ☐ | ☐ | ☐ | ☐ |
| Loads | ☐ | ☐ | ☐ | ☐ | ☐ |
| Drivers | ☐ | ☐ | ☐ | ☐ | ☐ |
| Settlements | ☐ | ☐ | ☐ | ☐ | ☐ |
| Expenses | ☐ | ☐ | ☐ | ☐ | ☐ |
| Reports | ☐ | ☐ | ☐ | ☐ | ☐ |
| Dispatch | ☐ | ☐ | ☐ | ☐ | ☐ |
| Fleet | ☐ | ☐ | ☐ | ☐ | ☐ |
| Customers | ☐ | ☐ | ☐ | ☐ | ☐ |
| Invoices | ☐ | ☐ | ☐ | ☐ | ☐ |
| Settings | ☐ | ☐ | ☐ | ☐ | ☐ |

### Real Device Testing

Test on actual devices if possible:

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad Safari

### Known Limitations

- Dispatch board drag-and-drop may not work on touch devices
- Complex charts may be cramped on very small screens
- Week input type has limited browser support

---

## Troubleshooting

### Hamburger menu not appearing

1. Check `mobile-nav.js` is loaded
2. Check `mobile-fixes.css` is loaded
3. Verify viewport width < 1024px

### Modal not full-screen

1. Check `mobile-fixes.css` Phase 3 section
2. Verify viewport width < 768px
3. Check for conflicting inline styles

### Table not scrolling

1. Verify table has `table-responsive` class
2. Check `mobile-fixes.css` Phase 2 section
3. Look for `overflow:hidden` on parent elements

### Stats cards not stacking

1. Verify viewport width < 768px (2 columns) or < 480px (1 column)
2. Check `mobile-fixes.css` Phase 4 section
3. Verify grid classes are present on container

---

## Implementation Details

### Files Modified

- `mobile-fixes.css` (~640 lines) - All mobile CSS
- `mobile-nav.js` (~170 lines) - Hamburger menu component
- 11 HTML files - Added mobile includes

### Breakpoints Used

- **1024px**: Hamburger menu appears
- **768px**: Modals go full-screen, tables compact, stats cards 2 columns
- **480px**: Stats cards single column

### Touch Targets

- Minimum button size: 44x44px
- Form input height: 48px
- Font size in inputs: 16px (prevents iOS zoom)

### Testing Tools

- Chrome DevTools Device Toolbar
- Responsive Design Mode (Firefox)
- Real device testing recommended
