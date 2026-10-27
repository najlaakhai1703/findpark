// FindPark Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderActiveVehicleBadges();
  renderSpotsList();
  renderHomePopularCards();
  renderVehiclesInBooking();
  updateBookingSummary();
  initEventListeners();
  renderHistoryList();
  
  // Hash-based routing or default to home/booking
  const currentHash = window.location.hash.replace('#', '');
  if (['home', 'explore', 'booking', 'payment', 'tracker', 'subscription', 'ev', 'history', 'emergency'].includes(currentHash)) {
    navigateTo('page-' + currentHash, false);
  } else {
    // Default show home page
    navigateTo('page-home', false);
  }

  // Listen to hash changes for browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'explore', 'booking', 'payment', 'tracker', 'subscription', 'ev', 'history', 'emergency'].includes(hash)) {
      navigateTo('page-' + hash, false);
    }
  });

  // Start 30-minute reservation countdown timer
  startReservationCountdown();

  // Start live parking timer for Find My Car
  startCarTrackerStopwatch();

  // Render new menus content
  renderSubscriptionPlans();
  renderEvStations();
}

// Navigation Router
function navigateTo(pageId, updateHash = true) {
  const pages = [
    'page-home', 
    'page-explore', 
    'page-booking', 
    'page-payment', 
    'page-tracker', 
    'page-subscription', 
    'page-ev', 
    'page-history', 
    'page-emergency'
  ];
  pages.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.classList.add('hidden');
  });

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update hash
  if (updateHash) {
    const routeName = pageId.replace('page-', '');
    window.location.hash = routeName;
  }

  // Update top navigation active styles
  const isDropdownSubpage = ['page-tracker', 'page-subscription', 'page-ev', 'page-emergency', 'page-history'].includes(pageId);
  const dropdownTrigger = document.getElementById('nav-services-dropdown-btn');
  if (dropdownTrigger) {
    if (isDropdownSubpage) {
      dropdownTrigger.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-[#008874] text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0';
    } else {
      dropdownTrigger.className = 'px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#008874] hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shrink-0';
    }
  }

  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    if (target === pageId) {
      btn.className = 'nav-link-btn px-3 py-2 rounded-xl text-xs font-bold bg-[#008874] text-white shadow-sm transition flex items-center gap-1.5 shrink-0';
    } else {
      btn.className = 'nav-link-btn px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#008874] hover:bg-slate-100 transition flex items-center gap-1.5 shrink-0';
    }
  });

  if (pageId === 'page-explore') {
    setTimeout(() => {
      initParkingMap();
    }, 200);
  }

  if (pageId === 'page-payment') {
    updatePaymentViewDetails();
  }
}

// ==========================================
// SEARCH & FILTER SYSTEM
// ==========================================
let currentHeroVehicle = 'Mobil';
function setHeroVehicle(type) {
  currentHeroVehicle = type;
  const btnMobil = document.getElementById('hero-veh-mobil');
  const btnMotor = document.getElementById('hero-veh-motor');
  
  if (type === 'Mobil') {
    if (btnMobil) btnMobil.className = 'flex-1 h-full text-xs font-bold bg-white text-slate-900 rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer';
    if (btnMotor) btnMotor.className = 'flex-1 h-full text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer';
  } else {
    if (btnMotor) btnMotor.className = 'flex-1 h-full text-xs font-bold bg-white text-slate-900 rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer';
    if (btnMobil) btnMobil.className = 'flex-1 h-full text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer';
  }
}

function handleHeroSearch(e) {
  if (e) e.preventDefault();
  
  const mallInput = document.getElementById('hero-search-mall');
  const query = (mallInput ? mallInput.value : '').trim().toLowerCase();
  const city = document.getElementById('hero-search-city')?.value || FindParkStore.currentCity || 'Semarang';
  const time = document.getElementById('hero-search-time')?.value || '13:00';
  
  // Update booking time
  FindParkStore.currentBooking.time = time;

  // Sync current city if selected in dropdown
  if (city !== FindParkStore.currentCity) {
    setCity(city, false);
  }

  // Search matching mall across spots in selected city or all
  const pool = (city === 'Semua' || city === 'Seluruh Indonesia')
    ? FindParkStore.spots
    : FindParkStore.spots.filter(s => s.city.toLowerCase() === city.toLowerCase());

  let matchedSpot = (pool.length > 0 ? pool : FindParkStore.spots).find(s => 
    s.name.toLowerCase().includes(query) || 
    s.address.toLowerCase().includes(query) ||
    s.area.toLowerCase().includes(query)
  );

  if (!matchedSpot) {
    matchedSpot = pool[0] || FindParkStore.spots[0];
  }

  // Button visual click feedback
  const btn = document.getElementById('btn-hero-search');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Mencari Slot...</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span>Cari Slot Sekarang</span>';
      btn.disabled = false;
      
      // Select spot on map & switch to explore view
      selectSpotFromMap(matchedSpot.id);
      navigateTo('page-explore');
      
      // Sync explore search input if exists
      const exploreInput = document.getElementById('explore-search-input');
      if (exploreInput && query) exploreInput.value = query;

      showToast(`🔍 Menemukan slot parkir di ${matchedSpot.name} (${matchedSpot.availableSlots} slot tersedia).`);
    }, 350);
  } else {
    selectSpotFromMap(matchedSpot.id);
    navigateTo('page-explore');
  }
}

function handleNavbarSearch() {
  const input = document.getElementById('navbar-search-input');
  if (!input) return;
  const q = input.value.trim().toLowerCase();

  if (!q) {
    showToast('Ketik nama mall atau gedung untuk mencari');
    input.focus();
    return;
  }

  const matchedSpot = FindParkStore.spots.find(s => 
    s.name.toLowerCase().includes(q) || 
    s.address.toLowerCase().includes(q) ||
    s.area.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q)
  );

  if (matchedSpot) {
    // If matched spot is from another city, auto-switch to that city
    if (matchedSpot.city.toLowerCase() !== (FindParkStore.currentCity || '').toLowerCase()) {
      setCity(matchedSpot.city, false);
    }
    selectSpotFromMap(matchedSpot.id);
    navigateTo('page-explore');
    
    const exploreInput = document.getElementById('explore-search-input');
    if (exploreInput) exploreInput.value = q;

    showToast(`📍 Menampilkan ${matchedSpot.name} di ${matchedSpot.city} (${matchedSpot.availableSlots} slot tersedia)`);
  } else {
    showToast(`Tidak ditemukan lokasi spesifik "${q}". Menampilkan semua hasil di ${FindParkStore.currentCity}.`);
    navigateTo('page-explore');
  }
}

function handleExploreSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const exploreContainer = document.getElementById('explore-spots-list');
  if (!exploreContainer) return;

  const currentCity = FindParkStore.currentCity || 'Semarang';
  const isAll = currentCity === 'Semua' || currentCity === 'Seluruh Indonesia';

  const baseSpots = isAll
    ? FindParkStore.spots
    : FindParkStore.spots.filter(s => s.city.toLowerCase() === currentCity.toLowerCase());

  const pool = baseSpots.length > 0 ? baseSpots : FindParkStore.spots;

  const filtered = pool.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.address.toLowerCase().includes(q) || 
    s.slotCode.toLowerCase().includes(q) ||
    s.area.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    exploreContainer.innerHTML = `
      <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 my-4 shadow-sm">
        <i class="fa-solid fa-magnifying-glass text-2xl text-slate-300 mb-2"></i>
        <h4 class="text-xs font-bold text-slate-800">Tidak ada spot parkir yang cocok</h4>
        <p class="text-[11px] text-slate-400 mt-1">Coba kata kunci lain atau pilih kota lain melalui tombol kota di bagian atas.</p>
      </div>
    `;
    return;
  }

  exploreContainer.innerHTML = filtered.map(s => `
    <div class="spot-list-card bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer mb-3 ${
      s.id === FindParkStore.currentBooking.spotId ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50/20' : ''
    }" data-spot-id="${s.id}" onclick="selectSpotFromMap('${s.id}')">
      <div class="flex gap-4">
        <div class="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover">
          <span class="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
            ${s.slotCode.split('-')[0]}
          </span>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                ${s.tagBadge}
              </span>
              <h4 class="font-bold text-slate-900 text-base mt-0.5">${s.name}</h4>
              <p class="text-xs text-slate-500">${s.address}</p>
            </div>
            <div class="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
              <i class="fa-solid fa-star text-amber-500 text-[10px]"></i>
              <span>${s.rating}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-500 mt-2">
            <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${s.openingHours}</span>
            <span>•</span>
            <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${s.distance}</span>
          </div>

          <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <div>
              <span class="text-base font-extrabold text-slate-900">${formatRupiah(s.ratePerHour)}</span>
              <span class="text-xs text-slate-500">/jam</span>
              <span class="ml-2 text-xs font-bold text-teal-700">${s.availableSlots} Slot Kosong</span>
            </div>
            <button onclick="event.stopPropagation(); bookThisSpot('${s.id}')" class="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-sm">
              Pesan Slot ${s.slotCode.split('-')[0]} &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Booking Spot selection
function bookThisSpot(spotId) {
  const spot = FindParkStore.spots.find(s => s.id === spotId) || FindParkStore.spots[0];
  FindParkStore.currentBooking.spotId = spot.id;
  
  // Update Spot Header Info on Booking Page
  const titleEl = document.getElementById('booking-spot-title');
  const subEl = document.getElementById('booking-spot-subtitle');
  const priceBadgeEl = document.getElementById('booking-spot-price');
  const breadcrumbEl = document.getElementById('booking-breadcrumb-spot');

  if (titleEl) titleEl.textContent = spot.name;
  if (subEl) subEl.textContent = spot.subLocation;
  if (priceBadgeEl) priceBadgeEl.textContent = `TARIF JAM PERTAMA ${formatRupiah(spot.ratePerHour)}/jam`;
  if (breadcrumbEl) breadcrumbEl.textContent = `Booking Slot ${spot.name}`;

  updateBookingSummary();
  navigateTo('page-booking');
  showToast(`Slot ${spot.name} dipilih. Silakan atur durasi & layanan.`);
}

function selectSpotFromMap(spotId) {
  FindParkStore.currentBooking.spotId = spotId;
  updateMapSelection(spotId);
  
  // Highlight list item on left
  document.querySelectorAll('.spot-list-card').forEach(c => {
    if (c.getAttribute('data-spot-id') === spotId) {
      c.classList.add('border-teal-500', 'ring-2', 'ring-teal-200', 'bg-teal-50/20');
      c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      c.classList.remove('border-teal-500', 'ring-2', 'ring-teal-200', 'bg-teal-50/20');
    }
  });
}

// Render vehicle badges across UI
function renderActiveVehicleBadges() {
  const active = FindParkStore.vehicles.find(v => v.plate === FindParkStore.activeVehiclePlate) || FindParkStore.vehicles[0];
  
  const headerBadge = document.getElementById('header-active-vehicle-plate');
  if (headerBadge) headerBadge.textContent = active.plate;

  const quickVehiclePill = document.getElementById('quick-reserve-plate-pill');
  if (quickVehiclePill) quickVehiclePill.textContent = active.plate;

  const userSaldoEl = document.getElementById('header-user-saldo');
  if (userSaldoEl) {
    userSaldoEl.textContent = `Saldo: ${formatRupiah(FindParkStore.user.balances.gopay)} (GoPay)`;
  }
}

// Render Vehicles in Booking Step
function renderVehiclesInBooking() {
  const container = document.getElementById('booking-vehicles-container');
  if (!container) return;

  container.innerHTML = FindParkStore.vehicles.map(v => {
    const isSelected = v.plate === FindParkStore.currentBooking.vehiclePlate;
    return `
      <label class="flex-1 min-w-[240px] flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${
        isSelected 
          ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-400' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center text-lg">
            <i class="fa-solid fa-car-side"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 tracking-wider text-sm font-mono">${v.plate}</span>
              ${v.isPrimary ? '<span class="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">Primary</span>' : ''}
            </div>
            <p class="text-xs text-slate-500 font-medium">${v.name} • ${v.type}</p>
          </div>
        </div>
        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500 bg-white' : 'border-slate-300'}">
          ${isSelected ? '<div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>' : ''}
        </div>
        <input type="radio" name="vehicle-select" value="${v.plate}" class="hidden" ${isSelected ? 'checked' : ''} onchange="selectVehicle('${v.plate}')" />
      </label>
    `;
  }).join('');
}

function selectVehicle(plate) {
  FindParkStore.currentBooking.vehiclePlate = plate;
  FindParkStore.activeVehiclePlate = plate;
  renderActiveVehicleBadges();
  renderVehiclesInBooking();
  updateBookingSummary();
}

// Add new vehicle modal logic
function openAddVehicleModal() {
  document.getElementById('modal-add-vehicle').classList.remove('hidden');
}

function closeAddVehicleModal() {
  document.getElementById('modal-add-vehicle').classList.add('hidden');
}

function handleAddVehicleSubmit(e) {
  e.preventDefault();
  const plate = document.getElementById('new-veh-plate').value.trim().toUpperCase();
  const name = document.getElementById('new-veh-name').value.trim();
  const type = document.getElementById('new-veh-type').value;

  if (!plate || !name) {
    alert('Mohon isi nomor plat dan tipe kendaraan');
    return;
  }

  const newVehicle = {
    id: 'v-' + Date.now(),
    plate,
    name,
    type,
    isPrimary: false
  };

  FindParkStore.vehicles.push(newVehicle);
  FindParkStore.activeVehiclePlate = plate;
  FindParkStore.currentBooking.vehiclePlate = plate;

  renderActiveVehicleBadges();
  renderVehiclesInBooking();
  closeAddVehicleModal();
  showToast(`Kendaraan ${plate} (${name}) berhasil ditambahkan!`);
}

// Duration Stepper & Cost Calculations
function changeDuration(delta) {
  let dur = FindParkStore.currentBooking.durationHours + delta;
  if (dur < 1) dur = 1;
  if (dur > 24) dur = 24;
  FindParkStore.currentBooking.durationHours = dur;

  // Update hours display
  const countEl = document.getElementById('duration-count');
  if (countEl) countEl.textContent = `${dur} Jam`;

  // Update estimated exit time
  const [inHour, inMin] = FindParkStore.currentBooking.time.split(':').map(Number);
  const outHour = (inHour + dur) % 24;
  const exitTimeStr = `${String(outHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')} WIB`;
  
  const exitEl = document.getElementById('duration-exit-time');
  if (exitEl) exitEl.textContent = `Perkiraan keluar pada pukul ${exitTimeStr}`;

  updateBookingSummary();
}

function toggleAddon(addonKey) {
  const isChecked = document.getElementById(`addon-${addonKey}`).checked;
  FindParkStore.currentBooking.addons[addonKey] = isChecked;
  updateBookingSummary();
}

function updateBookingSummary() {
  const spot = FindParkStore.spots.find(s => s.id === FindParkStore.currentBooking.spotId) || FindParkStore.spots[0];
  const dur = FindParkStore.currentBooking.durationHours;
  const parkingFee = spot.ratePerHour * dur;
  const serviceFee = 1000;
  const promo = FindParkStore.currentBooking.promoDiscount;

  // Addons fees
  let addonsTotal = 0;
  const addonDetails = [];

  if (FindParkStore.currentBooking.addons.valet) {
    addonsTotal += 25000;
    addonDetails.push({ name: 'Valet Parking VIP', price: 25000 });
  }
  if (FindParkStore.currentBooking.addons.ev) {
    addonsTotal += 30000;
    addonDetails.push({ name: 'EV Fast Charging Station', price: 30000 });
  }
  if (FindParkStore.currentBooking.addons.carwash) {
    addonsTotal += 40000;
    addonDetails.push({ name: 'Car Wash Express Exterior', price: 40000 });
  }

  const grandTotal = Math.max(0, parkingFee + serviceFee - promo + addonsTotal);

  // Update summary sidebar fields
  const summaryDurText = document.getElementById('summary-parking-duration-label');
  if (summaryDurText) summaryDurText.textContent = `Tarif Parkir (${dur} Jam)`;

  const summaryParkingFee = document.getElementById('summary-parking-fee');
  if (summaryParkingFee) summaryParkingFee.textContent = formatRupiah(parkingFee);

  const summaryAddonsContainer = document.getElementById('summary-addons-list');
  if (summaryAddonsContainer) {
    if (addonDetails.length > 0) {
      summaryAddonsContainer.innerHTML = addonDetails.map(a => `
        <div class="flex justify-between items-center text-xs text-slate-700 py-1 border-b border-dashed border-slate-100">
          <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i> ${a.name}</span>
          <span class="font-medium">+${formatRupiah(a.price)}</span>
        </div>
      `).join('');
      summaryAddonsContainer.classList.remove('hidden');
    } else {
      summaryAddonsContainer.innerHTML = '';
      summaryAddonsContainer.classList.add('hidden');
    }
  }

  const grandTotalEl = document.getElementById('summary-grand-total');
  if (grandTotalEl) grandTotalEl.textContent = formatRupiah(grandTotal);

  // Synchronize to state
  FindParkStore.currentBooking.calculated = {
    parkingFee,
    serviceFee,
    promo,
    addonsTotal,
    grandTotal
  };
}

// Proceed to payment page
function proceedToPayment() {
  // Sync form values
  const nameInput = document.getElementById('booker-name');
  const phoneInput = document.getElementById('booker-phone');
  const emailInput = document.getElementById('booker-email');

  if (nameInput) FindParkStore.currentBooking.bookerName = nameInput.value;
  if (phoneInput) FindParkStore.currentBooking.bookerPhone = phoneInput.value;
  if (emailInput) FindParkStore.currentBooking.bookerEmail = emailInput.value;

  navigateTo('page-payment');
  showToast('Memuat rincian pembayaran...');
}

// Update payment view details
function updatePaymentViewDetails() {
  const spot = FindParkStore.spots.find(s => s.id === FindParkStore.currentBooking.spotId) || FindParkStore.spots[0];
  const calc = FindParkStore.currentBooking.calculated || {
    parkingFee: 5000,
    serviceFee: 1000,
    promo: 1000,
    addonsTotal: 0,
    grandTotal: 5000
  };

  const dur = FindParkStore.currentBooking.durationHours;
  const plate = FindParkStore.currentBooking.vehiclePlate;

  // Header and order number
  const orderNumEl = document.getElementById('pay-order-number');
  if (orderNumEl) orderNumEl.textContent = `Order ${FindParkStore.currentBooking.orderNumber}`;

  // Slot and spot info
  const paySpotName = document.getElementById('pay-spot-name');
  if (paySpotName) paySpotName.textContent = spot.name;

  const paySpotAddress = document.getElementById('pay-spot-address');
  if (paySpotAddress) paySpotAddress.textContent = spot.address;

  const payPlateBadge = document.getElementById('pay-plate-badge');
  if (payPlateBadge) payPlateBadge.textContent = plate;

  const ticketPlateEl = document.getElementById('ticket-plate');
  if (ticketPlateEl) ticketPlateEl.textContent = plate;

  const ticketSpotName = document.getElementById('ticket-spot-name');
  if (ticketSpotName) ticketSpotName.textContent = spot.name.split('–')[0].trim();

  // Price rows
  const payBaseRate = document.getElementById('pay-base-rate');
  if (payBaseRate) payBaseRate.textContent = formatRupiah(calc.parkingFee);

  const payBaseLabel = document.getElementById('pay-base-label');
  if (payBaseLabel) payBaseLabel.textContent = `Tarif Dasar Parkir Mobil (${dur} Jam)`;

  const payTotalTagihan = document.getElementById('pay-total-tagihan');
  if (payTotalTagihan) payTotalTagihan.textContent = formatRupiah(calc.grandTotal);

  const ticketTotalTerbayar = document.getElementById('ticket-total-terbayar');
  if (ticketTotalTerbayar) ticketTotalTerbayar.textContent = formatRupiah(calc.grandTotal);

  // Check user balance for GoPay
  const gopayBalance = FindParkStore.user.balances.gopay;
  const gopayEl = document.getElementById('pay-gopay-balance');
  if (gopayEl) gopayEl.textContent = `Saldo Aktif: ${formatRupiah(gopayBalance)}`;
}

// Payment method switcher
function setPaymentMethod(method) {
  FindParkStore.currentBooking.paymentMethod = method;

  document.querySelectorAll('.payment-option-card').forEach(el => {
    const isThis = el.getAttribute('data-method') === method;
    if (isThis) {
      el.classList.add('border-teal-500', 'bg-teal-50/20');
      const radio = el.querySelector('.payment-radio-dot');
      if (radio) radio.innerHTML = '<div class="w-3 h-3 rounded-full bg-orange-500"></div>';
    } else {
      el.classList.remove('border-teal-500', 'bg-teal-50/20');
      const radio = el.querySelector('.payment-radio-dot');
      if (radio) radio.innerHTML = '';
    }
  });

  const payButtonDesc = document.getElementById('pay-button-desc');
  if (payButtonDesc) {
    if (method === 'gopay') payButtonDesc.textContent = 'Diproses otomatis via GoPay';
    else if (method === 'dana') payButtonDesc.textContent = 'Diproses via DANA Instant';
    else if (method === 'ovo') payButtonDesc.textContent = 'Diproses via OVO SmartPay';
    else if (method === 'qris') payButtonDesc.textContent = 'Scan QRIS Standar Nasional';
    else if (method.startsWith('va-')) payButtonDesc.textContent = 'Transfer Virtual Account';
  }

  if (method === 'qris') {
    openQrisModal();
  } else if (method.startsWith('va-')) {
    openVaModal(method.replace('va-', '').toUpperCase());
  }
}

// Process Payment Action ("Bayar & Amankan Slot Sekarang")
function executePayment() {
  const btn = document.getElementById('btn-bayar-sekarang');
  if (!btn) return;

  const originalContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
    <span>Memverifikasi & Menerbitkan E-Tiket...</span>
  `;

  // Simulate payment processing audio chime
  playSuccessSound();

  setTimeout(() => {
    // Deduct user balance
    const calc = FindParkStore.currentBooking.calculated || { grandTotal: 5000 };
    if (FindParkStore.user.balances.gopay >= calc.grandTotal) {
      FindParkStore.user.balances.gopay -= calc.grandTotal;
    }

    FindParkStore.currentBooking.isPaid = true;

    // Add to transaction history
    const spot = FindParkStore.spots.find(s => s.id === FindParkStore.currentBooking.spotId) || FindParkStore.spots[0];
    const newTx = {
      id: FindParkStore.currentBooking.orderNumber.replace('#', ''),
      spotName: spot.name,
      slotCode: 'G3-12',
      date: 'Hari Ini, 24 Mei 2025',
      timeSlot: `${FindParkStore.currentBooking.time} – ${String(Number(FindParkStore.currentBooking.time.split(':')[0]) + FindParkStore.currentBooking.durationHours).padStart(2, '0')}:00 WIB`,
      vehiclePlate: FindParkStore.currentBooking.vehiclePlate,
      amount: calc.grandTotal,
      paymentMethod: FindParkStore.currentBooking.paymentMethod.toUpperCase(),
      status: 'Aktif',
      statusClass: 'bg-emerald-100 text-emerald-800'
    };
    FindParkStore.transactions.unshift(newTx);

    renderActiveVehicleBadges();
    renderHistoryList();

    btn.disabled = false;
    btn.innerHTML = originalContent;

    // Show verified status confirmation card
    const statusBox = document.getElementById('ticket-status-badge');
    if (statusBox) {
      statusBox.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          STATUS TERKONFIRMASI
        </span>
      `;
    }

    // Trigger celebration toast & modal
    showPaymentSuccessCelebration();
  }, 1200);
}

// Pleasant Web Audio chime for transaction success
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // audio fallback
  }
}

function showPaymentSuccessCelebration() {
  showToast('🎉 Pembayaran Berhasil! E-Tiket Smart-Pass siap digunakan.');
  // Scroll to digital pass view
  const passCard = document.getElementById('digital-smart-pass-card');
  if (passCard) {
    passCard.classList.add('ring-4', 'ring-emerald-400');
    setTimeout(() => {
      passCard.classList.remove('ring-4', 'ring-emerald-400');
    }, 2500);
  }
}

// 30-Minute Reservation Hold Timer
function startReservationCountdown() {
  let timeLeft = 30 * 60; // 30 minutes in seconds
  const timerDisplay = document.getElementById('reservation-hold-timer');
  if (!timerDisplay) return;

  setInterval(() => {
    if (timeLeft <= 0) return;
    timeLeft--;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

// Interactive Feature 1: Indoor Floor Plan Wayfinding Simulation Modal
function openWayfindingModal() {
  const modal = document.getElementById('modal-wayfinding');
  if (modal) modal.classList.remove('hidden');
}

function closeWayfindingModal() {
  const modal = document.getElementById('modal-wayfinding');
  if (modal) modal.classList.add('hidden');
}

// Interactive Feature 2: ANPR Smart Barrier Simulation Modal
function openBarrierSimulationModal() {
  const modal = document.getElementById('modal-barrier-sim');
  if (modal) modal.classList.remove('hidden');
}

function closeBarrierSimulationModal() {
  const modal = document.getElementById('modal-barrier-sim');
  if (modal) modal.classList.add('hidden');
}

function triggerBarrierOpenSimulation() {
  const arm = document.getElementById('sim-barrier-arm');
  const statusText = document.getElementById('sim-barrier-status');
  const light = document.getElementById('sim-gate-light');

  if (statusText) statusText.textContent = 'Membaca Plat B 1256 AY via OCR ANPR...';
  
  setTimeout(() => {
    if (statusText) statusText.textContent = 'Plat Terverifikasi! Palang Otomatis Terbuka.';
    if (light) {
      light.classList.remove('bg-red-500');
      light.classList.add('bg-emerald-500');
    }
    if (arm) arm.classList.add('barrier-open');

    showToast('✅ Palang Terbuka! Selamat Datang di DP Mall Semarang.');

    setTimeout(() => {
      if (arm) arm.classList.remove('barrier-open');
      if (light) {
        light.classList.remove('bg-emerald-500');
        light.classList.add('bg-red-500');
      }
      if (statusText) statusText.textContent = 'Standby Palang Sensor.';
    }, 4500);
  }, 1000);
}

// Interactive Feature 3: Printable E-Tiket Modal
function openPrintTicketModal() {
  const modal = document.getElementById('modal-print-ticket');
  if (modal) modal.classList.remove('hidden');
}

function closePrintTicketModal() {
  const modal = document.getElementById('modal-print-ticket');
  if (modal) modal.classList.add('hidden');
}

function executePrintTicket() {
  window.print();
}

// QRIS Modal
function openQrisModal() {
  const modal = document.getElementById('modal-qris');
  if (modal) modal.classList.remove('hidden');
}

function closeQrisModal() {
  const modal = document.getElementById('modal-qris');
  if (modal) modal.classList.add('hidden');
}

function simulateQrisScanSuccess() {
  closeQrisModal();
  executePayment();
}

// Virtual Account Modal
function openVaModal(bankName) {
  const modal = document.getElementById('modal-va');
  const bankNameEl = document.getElementById('va-bank-name');
  const vaNumberEl = document.getElementById('va-number-code');
  
  if (bankNameEl) bankNameEl.textContent = bankName;
  if (vaNumberEl) {
    const prefix = bankName === 'BCA' ? '8021' : bankName === 'MANDIRI' ? '8801' : '1029';
    vaNumberEl.textContent = `${prefix} 0812 3456 7890`;
  }

  if (modal) modal.classList.remove('hidden');
}

function closeVaModal() {
  const modal = document.getElementById('modal-va');
  if (modal) modal.classList.add('hidden');
}

function copyVaNumber() {
  const vaText = document.getElementById('va-number-code')?.textContent || '';
  navigator.clipboard.writeText(vaText);
  showToast('Nomor Virtual Account disalin ke clipboard!');
}

// Kirim ke WhatsApp simulation
function shareToWhatsApp() {
  const bookingCode = FindParkStore.currentBooking.bookingCode;
  const plate = FindParkStore.currentBooking.vehiclePlate;
  const msg = `Halo Angelica, ini E-Tiket FindPark Anda: Kode Booking *${bookingCode}* untuk plat *${plate}* di DP Mall Semarang Slot G3-12. Akses tiket: https://findpark.id/pass/${bookingCode.replace(/\s+/g, '')}`;
  
  // Quick copy and toast preview
  navigator.clipboard.writeText(msg);
  showToast('📱 Ringkasan E-Tiket siap dikirim via WhatsApp ke +62 812-3456-7890!');
}

// Copy Booking Code
function copyBookingCode() {
  navigator.clipboard.writeText(FindParkStore.currentBooking.bookingCode);
  showToast('Kode booking disalin: ' + FindParkStore.currentBooking.bookingCode);
}

// Promo code applicator
function applyPromoCode() {
  const input = document.getElementById('promo-input-field');
  const val = input ? input.value.trim().toUpperCase() : '';

  if (val === 'FINDPARKHEMAT' || val === 'HEMAT5K' || val === 'PENGGUNABARU') {
    FindParkStore.currentBooking.promoDiscount = 2000;
    updateBookingSummary();
    updatePaymentViewDetails();
    showToast('Promo berhasil diterapkan! Potongan Rp 2.000');
  } else if (val) {
    showToast('Kode promo tidak valid atau telah kedaluwarsa.');
  }
}

// Render Spots List in Explore & Home
function renderSpotsList(cityFilter) {
  const exploreContainer = document.getElementById('explore-spots-list');
  if (!exploreContainer) return;

  const current = cityFilter || FindParkStore.currentCity || 'Semarang';
  const isAll = current === 'Semua' || current === 'Seluruh Indonesia';

  let list = isAll
    ? FindParkStore.spots
    : FindParkStore.spots.filter(s => s.city.toLowerCase() === current.toLowerCase());

  if (list.length === 0) {
    list = FindParkStore.spots;
  }

  exploreContainer.innerHTML = list.map(s => `
    <div class="spot-list-card bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer mb-3 ${
      s.id === FindParkStore.currentBooking.spotId ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50/20' : ''
    }" data-spot-id="${s.id}" onclick="selectSpotFromMap('${s.id}')">
      <div class="flex gap-4">
        <div class="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover">
          <span class="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
            ${s.slotCode.split('-')[0]}
          </span>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                  ${s.tagBadge}
                </span>
                <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  📍 ${s.city}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 text-base mt-0.5">${s.name}</h4>
              <p class="text-xs text-slate-500">${s.address}</p>
            </div>
            <div class="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
              <i class="fa-solid fa-star text-amber-500 text-[10px]"></i>
              <span>${s.rating}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-500 mt-2">
            <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${s.openingHours}</span>
            <span>•</span>
            <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${s.distance}</span>
          </div>

          <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <div>
              <span class="text-base font-extrabold text-slate-900">${formatRupiah(s.ratePerHour)}</span>
              <span class="text-xs text-slate-500">/jam</span>
              <span class="ml-2 text-xs font-bold text-teal-700">${s.availableSlots} Slot Kosong</span>
            </div>
            <button onclick="event.stopPropagation(); bookThisSpot('${s.id}')" class="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer">
              Pesan Slot ${s.slotCode.split('-')[0]} &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Render popular 4 cards on home page dynamically for chosen city or Indonesia
function renderHomePopularCards(cityName) {
  const container = document.getElementById('home-popular-cards-grid');
  if (!container) return;

  const current = cityName || FindParkStore.currentCity || 'Semarang';
  const isAll = current === 'Semua' || current === 'Seluruh Indonesia';

  let spots = isAll 
    ? FindParkStore.spots 
    : FindParkStore.spots.filter(s => s.city.toLowerCase() === current.toLowerCase());

  if (spots.length === 0) {
    spots = FindParkStore.spots.slice(0, 4);
  } else {
    spots = spots.slice(0, 4);
  }

  container.innerHTML = spots.map(s => `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition group flex flex-col justify-between">
      <div>
        <div class="relative h-40 bg-slate-100 overflow-hidden">
          <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <span class="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
            ${s.availableSlots} Slot Kosong
          </span>
          <span class="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            📍 ${s.city}
          </span>
        </div>
        <div class="p-4">
          <span class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
            ${s.tagBadge}
          </span>
          <h3 class="font-bold text-slate-900 text-base mt-1 line-clamp-1">${s.name}</h3>
          <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${s.address}</p>
          <div class="mt-3 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Tarif Mulai</span>
              <span class="text-base font-black text-slate-900">${formatRupiah(s.ratePerHour)}<span class="text-xs font-normal text-slate-500">/jam</span></span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700">Slot ${s.slotCode.split('-')[0]}</span>
          </div>
        </div>
      </div>
      <div class="px-4 pb-4">
        <button onclick="bookThisSpot('${s.id}')" class="w-full py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl transition text-center shadow-xs cursor-pointer">
          Pesan Cepat
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// INDONESIA CITY SELECTION SYSTEM
// ==========================================
let currentRegionFilter = 'Semua';

function openCityModal() {
  const modal = document.getElementById('city-selector-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  const input = document.getElementById('city-search-input');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }

  currentRegionFilter = 'Semua';
  renderCityRegionTabs();
  renderCityModalCards('');
}

function closeCityModal() {
  const modal = document.getElementById('city-selector-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

function setCityRegionFilter(region) {
  currentRegionFilter = region;
  renderCityRegionTabs();
  const searchVal = document.getElementById('city-search-input')?.value || '';
  renderCityModalCards(searchVal);
}

function handleCitySearchInput(query) {
  renderCityModalCards(query);
}

function renderCityRegionTabs() {
  const container = document.getElementById('city-region-tabs');
  if (!container) return;

  const regions = [
    { id: 'Semua', label: 'Semua Kota' },
    { id: 'Populer', label: '⭐ Kota Populer' },
    { id: 'Jawa', label: 'Pulau Jawa' },
    { id: 'Sumatera', label: 'Sumatera' },
    { id: 'Bali & Nusa Tenggara', label: 'Bali & Nusra' },
    { id: 'Kalimantan', label: 'Kalimantan' },
    { id: 'Sulawesi', label: 'Sulawesi' },
    { id: 'Maluku & Papua', label: 'Maluku & Papua' }
  ];

  container.innerHTML = regions.map(r => `
    <button type="button" onclick="setCityRegionFilter('${r.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
      currentRegionFilter === r.id 
        ? 'bg-[#008874] text-white shadow-sm ring-2 ring-teal-200' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }">
      ${r.label}
    </button>
  `).join('');
}

function renderCityModalCards(query = '') {
  const container = document.getElementById('city-modal-cards-grid');
  if (!container) return;

  const q = (query || '').trim().toLowerCase();
  let list = FindParkStore.cities;

  // Region filter
  if (currentRegionFilter === 'Populer') {
    list = list.filter(c => c.popular);
  } else if (currentRegionFilter !== 'Semua') {
    list = list.filter(c => c.region === currentRegionFilter);
  }

  // Search filter
  if (q) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.province.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fa-solid fa-map-location-dot text-4xl mb-3 text-slate-300"></i>
        <p class="font-bold text-sm text-slate-700">Kota "${query}" belum tersedia di pencarian langsung</p>
        <p class="text-xs text-slate-400 mt-1">Pilih kota terdekat atau pilih opsi "Seluruh Indonesia".</p>
      </div>
    `;
    return;
  }

  const current = (FindParkStore.currentCity || '').toLowerCase();

  // "Seluruh Indonesia" option when on 'Semua' and no query
  let html = '';
  if (currentRegionFilter === 'Semua' && !q) {
    const isAllActive = current === 'semua' || current === 'seluruh indonesia';
    html += `
      <div onclick="setCity('Seluruh Indonesia')" class="p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between col-span-full ${
        isAllActive 
          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200' 
          : 'bg-gradient-to-r from-teal-50/60 via-white to-orange-50/60 border-slate-200 hover:border-teal-400 hover:shadow-sm'
      }">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
            🇮🇩
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-black text-slate-900 text-sm">Seluruh Indonesia</h4>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Nasional</span>
            </div>
            <p class="text-[11px] text-slate-500">Akses semua mitra mall & gedung parkir di seluruh 38 provinsi</p>
          </div>
        </div>
        <div>
          ${isAllActive 
            ? '<span class="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full"><i class="fa-solid fa-check mr-1"></i> Aktif</span>' 
            : '<span class="text-xs font-bold text-teal-700 hover:underline">Jelajahi &rarr;</span>'
          }
        </div>
      </div>
    `;
  }

  html += list.map(city => {
    const isSelected = current === city.name.toLowerCase();
    const citySpots = FindParkStore.spots.filter(s => s.city.toLowerCase() === city.name.toLowerCase());
    const countLabel = citySpots.length > 0 ? `${citySpots.length} Spot Terverifikasi` : `${city.spotsCount}+ Titik Mitra`;

    return `
      <div onclick="setCity('${city.name}')" class="p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
        isSelected 
          ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-200 shadow-sm' 
          : 'bg-white border-slate-200 hover:border-teal-400 hover:bg-slate-50 hover:shadow-xs'
      }">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100/70 text-slate-700 group-hover:text-teal-700 flex items-center justify-center text-lg font-bold shrink-0 transition">
            ${city.icon || '📍'}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h4 class="font-extrabold text-slate-900 text-sm truncate">${city.name}</h4>
              ${city.popular ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Populer</span>' : ''}
            </div>
            <p class="text-[11px] text-slate-400 truncate">${city.province} • <span class="text-[#008874] font-semibold">${countLabel}</span></p>
          </div>
        </div>
        <div class="shrink-0 ml-2">
          ${isSelected 
            ? '<span class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-100/90 px-2.5 py-1 rounded-full"><i class="fa-solid fa-check text-[10px]"></i> Aktif</span>' 
            : '<span class="text-xs font-bold text-slate-300 group-hover:text-[#008874] transition"><i class="fa-solid fa-chevron-right text-[10px]"></i></span>'
          }
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Master city switch handler
function setCity(cityName, showNotification = true) {
  if (!cityName) return;
  FindParkStore.currentCity = cityName;

  // 1. Update navbar button
  const navCityLabel = document.getElementById('navbar-current-city');
  if (navCityLabel) navCityLabel.textContent = cityName;

  // 2. Update hero select dropdown
  const heroCitySelect = document.getElementById('hero-search-city');
  if (heroCitySelect) {
    heroCitySelect.value = cityName;
  }

  // 3. Update Explore page filter button & headers
  const exploreCityLabel = document.getElementById('explore-current-city-label');
  if (exploreCityLabel) {
    exploreCityLabel.textContent = cityName === 'Semua' || cityName === 'Seluruh Indonesia' ? 'Seluruh Indonesia' : `${cityName} Kota`;
  }

  const exploreHeading = document.getElementById('explore-spots-heading');
  if (exploreHeading) {
    exploreHeading.textContent = cityName === 'Semua' || cityName === 'Seluruh Indonesia' 
      ? 'Spot Parkir Tersedia di Seluruh Indonesia' 
      : `Spot Parkir Tersedia di ${cityName}`;
  }

  const exploreSearchInput = document.getElementById('explore-search-input');
  if (exploreSearchInput) {
    exploreSearchInput.placeholder = cityName === 'Semua' || cityName === 'Seluruh Indonesia'
      ? 'Cari mall di seluruh Indonesia...' 
      : `Cari mall di ${cityName}...`;
  }

  // 4. Update home section title
  const homeTitle = document.getElementById('home-popular-city-title');
  if (homeTitle) {
    homeTitle.textContent = cityName === 'Semua' || cityName === 'Seluruh Indonesia'
      ? 'Pilihan Slot Parkir Populer di Indonesia' 
      : `Pilihan Slot Parkir Populer ${cityName}`;
  }

  // 5. Re-render Spots List for Explore & Home
  renderSpotsList(cityName);
  renderHomePopularCards(cityName);

  // 6. Update Map Markers
  if (typeof renderMapMarkers === 'function') {
    renderMapMarkers(cityName);
  }

  // 7. Close Modal
  closeCityModal();

  // 8. Toast feedback
  if (showNotification) {
    const isAll = cityName === 'Semua' || cityName === 'Seluruh Indonesia';
    const count = isAll ? FindParkStore.spots.length : FindParkStore.spots.filter(s => s.city.toLowerCase() === cityName.toLowerCase()).length;
    showToast(`📍 Lokasi diubah ke ${isAll ? 'Seluruh Indonesia' : cityName} (${count > 0 ? count + ' spot siap booking' : 'Jaringan aktif'})`);
  }
}

// GPS Geolocation auto-detect handler
function useCurrentGpsLocation() {
  showToast('🛰️ Mengakses GPS untuk mendeteksi lokasi kota Anda...');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closestCity = FindParkStore.cities[0];
        let minDistance = Infinity;

        FindParkStore.cities.forEach(city => {
          const dLat = city.lat - latitude;
          const dLng = city.lng - longitude;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        });

        setCity(closestCity.name);
        showToast(`🎯 GPS Terdeteksi: Lokasi Anda di ${closestCity.name} (${closestCity.province})`);
      },
      () => {
        // Fallback simulation
        setTimeout(() => {
          setCity('Semarang');
          showToast('🎯 GPS Terdeteksi: Semarang Pusat (Akurasi ±15m)');
        }, 500);
      },
      { timeout: 4000 }
    );
  } else {
    setTimeout(() => {
      setCity('Semarang');
      showToast('🎯 GPS Terdeteksi: Semarang');
    }, 500);
  }
}

// Render History
function renderHistoryList() {
  const container = document.getElementById('history-orders-container');
  if (!container) return;

  container.innerHTML = FindParkStore.transactions.map(t => `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg font-bold">
            <i class="fa-solid fa-square-parking"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900">${t.spotName}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${t.statusClass}">${t.status}</span>
            </div>
            <span class="text-xs text-slate-500">Order #${t.id} • ${t.date}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="block text-xs text-slate-400">Total Biaya</span>
          <span class="text-base font-extrabold text-slate-900">${formatRupiah(t.amount)}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-slate-600">
        <div class="flex items-center gap-4">
          <div><strong class="text-slate-800">Slot:</strong> ${t.slotCode}</div>
          <div><strong class="text-slate-800">Plat:</strong> ${t.vehiclePlate}</div>
          <div><strong class="text-slate-800">Waktu:</strong> ${t.timeSlot}</div>
          <div><strong class="text-slate-800">Metode:</strong> ${t.paymentMethod}</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="navigateTo('page-payment')" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg transition">
            Lihat E-Tiket &rarr;
          </button>
          <button onclick="openPrintTicketModal()" class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition">
            <i class="fa-solid fa-download mr-1"></i> Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Global Toast message
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/90 text-white backdrop-blur shadow-2xl flex items-center gap-3 text-sm font-medium transition-all transform duration-300 opacity-0 translate-y-3';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-bell text-orange-400"></i> <span>${message}</span>`;
  toast.classList.remove('opacity-0', 'translate-y-3');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-3');
  }, 3500);
}

// Auth modal handlers
function openAuthModal() {
  document.getElementById('modal-auth').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('modal-auth').classList.add('hidden');
}

function switchAuthTab(mode) {
  const tabMasuk = document.getElementById('auth-tab-masuk');
  const tabDaftar = document.getElementById('auth-tab-daftar');
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (mode === 'masuk') {
    tabMasuk.className = 'flex-1 py-2 text-center text-xs font-bold text-slate-800 bg-white rounded-lg shadow-sm';
    tabDaftar.className = 'flex-1 py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-800';
    if (title) title.textContent = 'Login •';
    if (submitBtn) submitBtn.innerHTML = 'Masuk ke Akun FindPark <i class="fa-solid fa-arrow-right ml-2"></i>';
  } else {
    tabDaftar.className = 'flex-1 py-2 text-center text-xs font-bold text-slate-800 bg-white rounded-lg shadow-sm';
    tabMasuk.className = 'flex-1 py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-800';
    if (title) title.textContent = 'Daftar Akun Baru •';
    if (submitBtn) submitBtn.innerHTML = 'Buat Akun FindPark <i class="fa-solid fa-arrow-right ml-2"></i>';
  }
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('auth-password');
  const icon = document.getElementById('auth-pwd-eye');
  if (pwdInput) {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye-slash text-slate-400';
    } else {
      pwdInput.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye text-slate-400';
    }
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  closeAuthModal();
  showToast('Selamat datang kembali, Angelica Prameswari!');
}

function initEventListeners() {
  // Add vehicle form
  const addVehForm = document.getElementById('form-add-vehicle');
  if (addVehForm) addVehForm.addEventListener('submit', handleAddVehicleSubmit);

  // Auth form
  const authForm = document.getElementById('form-auth-login');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
}

// ==========================================
// NEW MENU HANDLERS
// ==========================================

// 1. Find My Car Live Stopwatch
let trackerSeconds = 2894; // starts at ~48 mins
function startCarTrackerStopwatch() {
  setInterval(() => {
    trackerSeconds++;
    const hrs = Math.floor(trackerSeconds / 3600);
    const mins = Math.floor((trackerSeconds % 3600) / 60);
    const secs = trackerSeconds % 60;
    
    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('tracker-stopwatch-display');
    if (el) el.textContent = formatted;
  }, 1000);
}

// 2. Play Realistic Car Horn via Web Audio API
function triggerCarHonk() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play two classic dual-tone car horn bursts
    [0, 0.28].forEach(startTime => {
      // High tone ~440Hz, Low tone ~349Hz
      [440, 349].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + 0.22);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + 0.23);
      });
    });

    showToast('🔊 BEEP! BEEP! Klakson mobil B 1256 AY berbunyi di Lantai G3.');
  } catch (e) {
    showToast('🔊 Klakson mobil B 1256 AY berbunyi!');
  }
}

// 3. Toggle Car Hazard Lights
let isHazardOn = false;
function toggleHazardLights() {
  isHazardOn = !isHazardOn;
  const lights = document.querySelectorAll('.car-hazard-indicator');
  const btn = document.getElementById('btn-toggle-hazard');

  lights.forEach(l => {
    if (isHazardOn) {
      l.classList.add('hazard-active');
    } else {
      l.classList.remove('hazard-active');
    }
  });

  if (btn) {
    btn.className = isHazardOn
      ? 'flex-1 py-3 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 ring-2 ring-amber-300'
      : 'flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2';
  }

  showToast(isHazardOn ? '💡 Lampu Hazard mobil B 1256 AY berkedip aktif!' : 'Lampu Hazard dimatikan.');
}

// 4. Render Subscription Plans
function renderSubscriptionPlans() {
  const container = document.getElementById('subscription-plans-grid');
  if (!container) return;

  container.innerHTML = FindParkStore.subscriptionPlans.map(plan => `
    <div class="bg-white rounded-3xl p-6 border ${plan.isCurrent ? 'border-teal-500 ring-2 ring-teal-200 shadow-lg' : 'border-slate-200 shadow-sm'} flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            plan.isCurrent ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
          }">
            ${plan.badge}
          </span>
          ${plan.isCurrent ? '<span class="text-xs font-bold text-emerald-600 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Paket Aktif Anda</span>' : ''}
        </div>

        <h3 class="text-xl font-black text-slate-900">${plan.name}</h3>
        <p class="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">${plan.description}</p>

        <div class="mb-5 pb-4 border-b border-slate-100">
          <span class="text-3xl font-black text-slate-900">${formatRupiah(plan.price)}</span>
          <span class="text-xs text-slate-400 font-medium">/${plan.period}</span>
        </div>

        <ul class="space-y-2.5 text-xs text-slate-600 mb-6">
          ${plan.features.map(f => `
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-check text-teal-600 mt-0.5 text-xs"></i>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button onclick="subscribeToPlan('${plan.id}')" class="w-full py-3 rounded-xl font-bold text-xs transition ${
        plan.isCurrent 
          ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100' 
          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
      }">
        ${plan.isCurrent ? 'Kelola / Perpanjang Paket' : 'Pilih Paket Ini &rarr;'}
      </button>
    </div>
  `).join('');
}

function subscribeToPlan(planId) {
  const plan = FindParkStore.subscriptionPlans.find(p => p.id === planId);
  if (!plan) return;

  playSuccessSound();
  showToast(`🎉 Berhasil mendaftar ${plan.name}! Auto-Pass aktif di gerbang mall.`);
}

// 5. Render EV Charging Stations
function renderEvStations() {
  const container = document.getElementById('ev-stations-grid');
  if (!container) return;

  container.innerHTML = FindParkStore.evStations.map(station => `
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
      <div class="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            ${station.openStatus}
          </span>
          <h3 class="text-base font-extrabold text-slate-900 mt-1">${station.name}</h3>
          <p class="text-xs text-slate-500">${station.address}</p>
        </div>
        <span class="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl">
          ${station.power}
        </span>
      </div>

      <div class="mb-4">
        <span class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Status Port Konektor</span>
        <div class="grid grid-cols-2 gap-2">
          ${station.connectors.map(c => `
            <div class="p-2.5 rounded-xl border border-slate-100 ${c.class} flex items-center justify-between text-xs">
              <span class="font-bold">${c.type}</span>
              <span class="text-[10px] font-semibold">${c.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <span class="text-[10px] text-slate-400 block">Tarif Listrik Resmi</span>
          <strong class="text-slate-800 text-xs">${formatRupiah(station.ratePerKwh)}/kWh</strong>
        </div>
        <button onclick="startSimulateEvCharging('${station.name}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5">
          <i class="fa-solid fa-bolt"></i>
          <span>Hubungkan Charging</span>
        </button>
      </div>
    </div>
  `).join('');
}

// 6. EV Charging Simulator
let chargingPercent = 42;
let chargingInterval = null;
function startSimulateEvCharging(stationName) {
  const modal = document.getElementById('modal-ev-charging-sim');
  if (modal) modal.classList.remove('hidden');

  const stationTitle = document.getElementById('ev-sim-station-title');
  if (stationTitle) stationTitle.textContent = stationName;

  const meter = document.getElementById('ev-charging-meter');
  const percentText = document.getElementById('ev-charging-percent');
  const kwhText = document.getElementById('ev-charging-kwh');

  if (chargingInterval) clearInterval(chargingInterval);

  chargingInterval = setInterval(() => {
    if (chargingPercent >= 88) {
      clearInterval(chargingInterval);
      showToast('⚡ Baterai telah terisi 88%! Siap untuk melanjutkan perjalanan.');
      return;
    }
    chargingPercent += 2;
    if (meter) meter.style.width = chargingPercent + '%';
    if (percentText) percentText.textContent = chargingPercent + '%';
    if (kwhText) kwhText.textContent = (chargingPercent * 0.45).toFixed(1) + ' kWh';
  }, 700);

  showToast(`⚡ Tersambung ke ${stationName}! Pengisian daya cepat dimulai.`);
}

function closeEvChargingModal() {
  if (chargingInterval) clearInterval(chargingInterval);
  const modal = document.getElementById('modal-ev-charging-sim');
  if (modal) modal.classList.add('hidden');
}

// 7. Emergency & Roadside Help
function requestEmergencyHelp(type) {
  playSuccessSound();
  showToast(`🚨 Bantuan "${type}" berhasil dikirim! Petugas lapangan DP Mall meluncur ke Tiang B14.`);
}

// 8. Live Support Chat Simulation
function sendSupportChatMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('support-chat-input');
  const chatBox = document.getElementById('support-chat-messages');
  if (!input || !chatBox || !input.value.trim()) return;

  const userMsg = input.value.trim();
  input.value = '';

  // Append user message
  chatBox.innerHTML += `
    <div class="flex justify-end mb-2">
      <div class="bg-teal-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-xs max-w-xs shadow-xs">
        ${userMsg}
      </div>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;

  // Bot auto-reply after 800ms
  setTimeout(() => {
    let reply = 'Petugas Customer Service FindPark siap membantu! Posisi Anda saat ini di DP Mall Lantai G3 terdeteksi aman.';
    if (userMsg.toLowerCase().includes('bayar') || userMsg.toLowerCase().includes('gopay')) {
      reply = 'Pembayaran parkir dapat diproses otomatis lewat GoPay, DANA, QRIS, atau Virtual Account tanpa perlu karcis fisik!';
    } else if (userMsg.toLowerCase().includes('mobil') || userMsg.toLowerCase().includes('slot')) {
      reply = 'Mobil Anda dengan plat B 1256 AY saat ini aman terparkir di Slot G3-12 (Pilar B14 dekat Lobby XXI).';
    }

    chatBox.innerHTML += `
      <div class="flex justify-start mb-2">
        <div class="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs max-w-xs border border-slate-200">
          <span class="block text-[10px] font-bold text-teal-700 mb-0.5">CS FindPark Official</span>
          ${reply}
        </div>
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 800);
}

