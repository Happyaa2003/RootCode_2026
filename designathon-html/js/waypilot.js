/**
 * WayPilot — Intelligent Delivery Planning System
 * Lightweight Vanilla JavaScript Interactions for Designathon Presentation Screens
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. Theme Management (Light / Dark) ──────────────────────────────────
  const savedTheme = localStorage.getItem('waypoint-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtns = document.querySelectorAll('[data-action="toggle-theme"]');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('waypoint-theme', next);
      updateThemeIcons(next);
    });
  });

  function updateThemeIcons(theme) {
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      if (theme === 'dark') {
        el.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      } else {
        el.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
    });
  }
  updateThemeIcons(savedTheme);

  // ─── 2. Topbar Operations Dropdown ────────────────────────────────────────
  const dropdownContainers = document.querySelectorAll('.waypoint-dropdown-tab');
  dropdownContainers.forEach(container => {
    const trigger = container.querySelector('.dropdown-trigger');
    const menu = container.querySelector('.waypoint-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      closeAllDropdowns();
      if (!isOpen) menu.style.display = 'block';
    });
  });

  document.addEventListener('click', () => closeAllDropdowns());
  function closeAllDropdowns() {
    document.querySelectorAll('.waypoint-dropdown-menu').forEach(m => m.style.display = 'none');
  }

  // ─── 3. Drawer Open / Close System ─────────────────────────────────────────
  window.openDrawer = function(drawerId) {
    const backdrop = document.getElementById(drawerId ? `${drawerId}-backdrop` : 'drawer-backdrop') || document.querySelector('.drawer-backdrop');
    const panel = document.getElementById(drawerId || 'order-drawer') || document.querySelector('.drawer-panel');
    if (backdrop) backdrop.classList.add('is-open');
    if (panel) panel.classList.add('is-open');
  };

  window.closeDrawer = function(drawerId) {
    const backdrop = document.getElementById(drawerId ? `${drawerId}-backdrop` : 'drawer-backdrop') || document.querySelector('.drawer-backdrop');
    const panel = document.getElementById(drawerId || 'order-drawer') || document.querySelector('.drawer-panel');
    if (backdrop) backdrop.classList.remove('is-open');
    if (panel) panel.classList.remove('is-open');
  };

  document.querySelectorAll('[data-close-drawer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const drawerId = btn.getAttribute('data-close-drawer');
      window.closeDrawer(drawerId);
    });
  });

  document.querySelectorAll('.drawer-backdrop').forEach(bd => {
    bd.addEventListener('click', () => {
      document.querySelectorAll('.drawer-backdrop').forEach(b => b.classList.remove('is-open'));
      document.querySelectorAll('.drawer-panel').forEach(p => p.classList.remove('is-open'));
    });
  });

  // ─── 4. Modal Open / Close System ──────────────────────────────────────────
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('is-open');
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('is-open');
  };

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-open-modal');
      window.openModal(modalId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-close-modal');
      window.closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('is-open');
    });
  });

  // ─── 5. Tab Switching Engine ──────────────────────────────────────────────
  const tabContainers = document.querySelectorAll('[data-tab-group]');
  tabContainers.forEach(container => {
    const tabBtns = container.querySelectorAll('[data-tab-target]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.getAttribute('data-tab-target');
        const contentContainers = document.querySelectorAll(`[data-tab-content="${container.getAttribute('data-tab-group')}"]`);
        contentContainers.forEach(content => {
          if (content.id === targetId) {
            content.style.display = content.getAttribute('data-display-type') || 'block';
          } else {
            content.style.display = 'none';
          }
        });
      });
    });
  });

  // ─── 6. Table Row Filters & Search ─────────────────────────────────────────
  const searchInputs = document.querySelectorAll('[data-table-search]');
  searchInputs.forEach(input => {
    const tableId = input.getAttribute('data-table-search');
    const table = document.getElementById(tableId);
    if (!table) return;

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });

  const filterPillGroups = document.querySelectorAll('[data-filter-group]');
  filterPillGroups.forEach(group => {
    const pills = group.querySelectorAll('.waypoint-pill, .filter-select');
    const targetTableId = group.getAttribute('data-filter-group');
    const table = document.getElementById(targetTableId);
    if (!table) return;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filterVal = pill.getAttribute('data-filter') || pill.textContent.trim();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
          if (filterVal === 'All') {
            row.style.display = '';
          } else {
            const rowText = row.textContent;
            row.style.display = rowText.includes(filterVal) ? '' : 'none';
          }
        });
      });
    });
  });

  // ─── 7. Interactive Order Selection & Drawer Populator ─────────────────────
  document.querySelectorAll('tr[data-order-id]').forEach(row => {
    row.addEventListener('click', () => {
      const orderId = row.getAttribute('data-order-id');
      const outlet = row.getAttribute('data-outlet') || 'FreshMart Nugegoda';
      const status = row.getAttribute('data-status') || 'Completed';
      const price = row.getAttribute('data-price') || '$1,240.00';
      const cost = row.getAttribute('data-cost') || '$28.40';
      const margin = row.getAttribute('data-margin') || '$1,211.60';
      const eta = row.getAttribute('data-eta') || '08:28 AM';
      const windowTime = row.getAttribute('data-window') || '08:28–08:38';
      const brand = row.getAttribute('data-brand') || 'Fresh';
      const district = row.getAttribute('data-district') || 'Colombo';
      const address = row.getAttribute('data-address') || '42 Old Kesbewa Rd, Nugegoda';
      const volume = row.getAttribute('data-volume') || '2.4 m³';
      const weight = row.getAttribute('data-weight') || '438 kg';
      const temp = row.getAttribute('data-temp') || 'Chilled';

      // Update drawer elements if they exist
      const titleEl = document.getElementById('drawer-order-id');
      if (titleEl) titleEl.textContent = `Order ${orderId}`;
      const outletEl = document.getElementById('drawer-outlet-name');
      if (outletEl) outletEl.textContent = outlet;
      const statusEl = document.getElementById('drawer-status-badge');
      if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = `status-badge ${status === 'Delivered' || status === 'Completed' ? 'badge-delivered' : status === 'En Route' ? 'badge-en-route' : status === 'Failed' ? 'badge-failed' : 'badge-planned'}`;
      }
      const priceEl = document.getElementById('drawer-item-price');
      if (priceEl) priceEl.textContent = price;
      const costEl = document.getElementById('drawer-delivery-cost');
      if (costEl) costEl.textContent = cost;
      const marginEl = document.getElementById('drawer-delivery-margin');
      if (marginEl) marginEl.textContent = margin;
      const etaEl = document.getElementById('drawer-eta');
      if (etaEl) etaEl.textContent = eta;
      const windowEl = document.getElementById('drawer-window');
      if (windowEl) windowEl.textContent = windowTime;
      const addressEl = document.getElementById('drawer-address');
      if (addressEl) addressEl.textContent = address;
      const metaEl = document.getElementById('drawer-meta');
      if (metaEl) metaEl.textContent = `Brand: ${brand} · District: ${district} · Volume: ${volume} · Weight: ${weight} · Temp: ${temp}`;

      window.openDrawer('order-drawer');
    });
  });

  // ─── 8. Optimization Modal Simulation ──────────────────────────────────────
  const startOptimBtn = document.getElementById('btn-start-optimization');
  if (startOptimBtn) {
    startOptimBtn.addEventListener('click', () => {
      const configView = document.getElementById('optim-view-config');
      const runningView = document.getElementById('optim-view-running');
      const resultsView = document.getElementById('optim-view-results');
      if (!configView || !runningView || !resultsView) return;

      configView.style.display = 'none';
      runningView.style.display = 'block';

      const steps = [
        'Analyzing delivery windows and Sri Lankan road constraints...',
        'Matching Colombo & Peliyagoda vehicle capacity and reefer units...',
        'Optimizing routing matrix with real-time speed profiles...',
        'Validating turnaround times and Avurudda buffer tolerances...',
        'Finalizing optimal multi-depot distribution plan...'
      ];

      let stepIdx = 0;
      const statusLabel = document.getElementById('optim-running-status');
      const progressBar = document.getElementById('optim-progress-bar');

      const interval = setInterval(() => {
        stepIdx++;
        if (statusLabel && steps[stepIdx]) statusLabel.textContent = steps[stepIdx];
        if (progressBar) progressBar.style.width = `${Math.min(100, Math.round((stepIdx / steps.length) * 100))}%`;

        if (stepIdx >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            runningView.style.display = 'none';
            resultsView.style.display = 'block';
          }, 400);
        }
      }, 550);
    });
  }

  // ─── 9. Toast Notification Helper ──────────────────────────────────────────
  window.showToast = function(message, type = 'success') {
    const existing = document.getElementById('waypilot-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'waypilot-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${type === 'success' ? '#0F172A' : type === 'warning' ? '#B45309' : '#DC2626'};
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100000;
      animation: toastSlideUp 0.25s ease-out;
    `;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#34D399' : '#FCD34D'}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };
});
