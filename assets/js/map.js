// Interactive Indonesia Parking Map Handler (Leaflet.js + CartoDB)
let leafletMap = null;
let mapMarkers = [];
let userLocationMarker = null;
let simulatedRouteLine = null;

function initParkingMap() {
  const mapContainer = document.getElementById('semarang-map');
  if (!mapContainer) return;

  const currentCityName = FindParkStore.currentCity || 'Semarang';
  const cityData = FindParkStore.cities.find(c => c.name.toLowerCase() === currentCityName.toLowerCase()) || FindParkStore.cities[0];
  const defaultCenter = [cityData.lat, cityData.lng];
  const defaultZoom = cityData.zoom || 14;

  try {
    if (typeof L !== 'undefined') {
      if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
        mapMarkers = [];
      }

      leafletMap = L.map('semarang-map', {
        zoomControl: false
      }).setView(defaultCenter, defaultZoom);

      // Clean CartoDB Voyager tiles (modern, soft, clean light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletMap);

      // Add custom zoom control in top right matching Figma
      L.control.zoom({ position: 'topright' }).addTo(leafletMap);

      // Render markers for current city
      renderMapMarkers(currentCityName, FindParkStore.currentBooking.spotId);

    } else {
      renderSvgMapFallback();
    }
  } catch (e) {
    console.warn('Leaflet error, using SVG fallback', e);
    renderSvgMapFallback();
  }
}

// Dynamically render markers for selected Indonesian city or All Cities
function renderMapMarkers(cityName, selectedSpotId) {
  if (!leafletMap || typeof L === 'undefined') return;

  // Clear existing markers
  mapMarkers.forEach(m => {
    if (m.marker) leafletMap.removeLayer(m.marker);
  });
  mapMarkers = [];

  if (simulatedRouteLine) {
    leafletMap.removeLayer(simulatedRouteLine);
    simulatedRouteLine = null;
  }
  if (userLocationMarker) {
    leafletMap.removeLayer(userLocationMarker);
    userLocationMarker = null;
  }

  // Filter spots for this city or all Indonesia
  let spotsToDisplay = [];
  const isAll = !cityName || cityName === 'Semua' || cityName === 'Seluruh Indonesia';

  if (isAll) {
    spotsToDisplay = FindParkStore.spots;
  } else {
    spotsToDisplay = FindParkStore.spots.filter(s => s.city.toLowerCase() === cityName.toLowerCase());
  }

  // If no spot specifically seeded for this city, fall back to nearest/all
  if (spotsToDisplay.length === 0) {
    spotsToDisplay = FindParkStore.spots;
  }

  // Pick target spot
  let activeSpot = spotsToDisplay.find(s => s.id === selectedSpotId);
  if (!activeSpot) {
    activeSpot = spotsToDisplay[0];
    if (activeSpot) {
      FindParkStore.currentBooking.spotId = activeSpot.id;
    }
  }

  // Fly / pan map to city center
  const cityData = FindParkStore.cities.find(c => c.name.toLowerCase() === (cityName || '').toLowerCase());
  if (cityData && !isAll) {
    leafletMap.flyTo([cityData.lat, cityData.lng], cityData.zoom || 13, { duration: 0.9 });
  } else if (isAll) {
    leafletMap.flyTo([-2.5, 118.0], 5, { duration: 1.2 }); // Center Indonesia
  } else if (activeSpot) {
    leafletMap.flyTo([activeSpot.lat, activeSpot.lng], 14, { duration: 0.9 });
  }

  // Add markers
  spotsToDisplay.forEach(spot => {
    const isSelected = activeSpot && spot.id === activeSpot.id;
    
    // Custom HTML marker pill
    const markerHtml = `
      <div id="marker-pill-${spot.id}" class="relative cursor-pointer transition-transform hover:scale-110 active:scale-95">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border-2 ${
          isSelected 
            ? 'bg-orange-500 text-white border-white ring-4 ring-orange-200' 
            : 'bg-white text-slate-800 border-teal-600 hover:border-orange-500'
        }">
          <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}"></span>
          <span>${spot.shortName || spot.name.split('–')[0].trim()}</span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] ${
          isSelected ? 'border-t-orange-500' : 'border-t-white'
        } mx-auto"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-map-pin',
      iconSize: [120, 36],
      iconAnchor: [60, 36]
    });

    const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(leafletMap);

    marker.on('click', () => {
      selectSpotFromMap(spot.id);
    });

    mapMarkers.push({ id: spot.id, spot, marker });
  });

  // Simulated GPS dashed route from user to active spot
  if (activeSpot) {
    const userLat = activeSpot.lat - 0.0035;
    const userLng = activeSpot.lng + 0.0035;

    const routePoints = [
      [userLat, userLng],
      [activeSpot.lat - 0.0015, activeSpot.lng + 0.0018],
      [activeSpot.lat, activeSpot.lng]
    ];

    simulatedRouteLine = L.polyline(routePoints, {
      color: '#fa5a00',
      weight: 4,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(leafletMap);

    userLocationMarker = L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: '#0ea5e9',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(leafletMap);

    updateSelectedMallCard(activeSpot.id);
  }
}

function updateMapSelection(selectedId) {
  const target = FindParkStore.spots.find(s => s.id === selectedId);
  if (!target) return;

  if (leafletMap) {
    leafletMap.flyTo([target.lat, target.lng], 15, { duration: 0.8 });

    // Update marker active styles
    mapMarkers.forEach(item => {
      const el = document.getElementById(`marker-pill-${item.id}`);
      if (el) {
        const isSelected = item.id === selectedId;
        const pill = el.querySelector('div:first-child');
        const arrow = el.querySelector('div:last-child');
        const dot = el.querySelector('span:first-child');

        if (isSelected) {
          pill.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border-2 bg-orange-500 text-white border-white ring-4 ring-orange-200';
          arrow.className = 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-orange-500 mx-auto';
          if (dot) dot.className = 'w-2 h-2 rounded-full bg-white';
        } else {
          pill.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border-2 bg-white text-slate-800 border-teal-600 hover:border-orange-500';
          arrow.className = 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-white mx-auto';
          if (dot) dot.className = 'w-2 h-2 rounded-full bg-teal-500';
        }
      }
    });

    // Re-draw route to new selected target
    if (simulatedRouteLine) leafletMap.removeLayer(simulatedRouteLine);
    if (userLocationMarker) leafletMap.removeLayer(userLocationMarker);

    const userLat = target.lat - 0.0035;
    const userLng = target.lng + 0.0035;
    const routePoints = [
      [userLat, userLng],
      [target.lat - 0.0015, target.lng + 0.0018],
      [target.lat, target.lng]
    ];

    simulatedRouteLine = L.polyline(routePoints, {
      color: '#fa5a00',
      weight: 4,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(leafletMap);

    userLocationMarker = L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: '#0ea5e9',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(leafletMap);
  }

  updateSelectedMallCard(selectedId);
}

function updateSelectedMallCard(spotId) {
  const spot = FindParkStore.spots.find(s => s.id === spotId) || FindParkStore.spots[0];
  const cardContainer = document.getElementById('map-selected-card');
  if (!cardContainer) return;

  const duration = FindParkStore.currentBooking.durationHours || 2;
  const total = spot.ratePerHour * duration;

  cardContainer.innerHTML = `
    <div class="flex items-start justify-between mb-2">
      <div>
        <span class="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-teal-800 rounded-md mb-1">
          📍 ${spot.city} • ${spot.area}
        </span>
        <h4 class="text-lg font-bold text-slate-900">${spot.name}</h4>
        <p class="text-xs text-slate-500">${spot.address}</p>
      </div>
      <div class="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 shrink-0">
        <i class="fa-solid fa-circle-check"></i>
      </div>
    </div>

    <div class="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-slate-600 font-medium"><i class="fa-solid fa-car text-teal-600 mr-1"></i> Kapasitas Real-time</span>
        <span class="font-bold text-teal-700">${spot.availableSlots} Slot Kosong (${Math.round((spot.totalSlots - spot.availableSlots) / spot.totalSlots * 100)}% Terisi)</span>
      </div>
      <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div class="bg-teal-600 h-full rounded-full transition-all duration-500" style="width: ${Math.round((spot.totalSlots - spot.availableSlots) / spot.totalSlots * 100)}%"></div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center text-xs mb-4">
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase font-bold">Total Slot</span>
        <strong class="text-slate-800 text-sm">${spot.totalSlots}</strong>
      </div>
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase font-bold">Tersedia</span>
        <strong class="text-emerald-600 text-sm">${spot.availableSlots}</strong>
      </div>
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase font-bold">Sensor IoT</span>
        <strong class="text-orange-500 text-sm font-bold flex items-center justify-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 sensor-live-indicator"></span> Aktif
        </strong>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
      <div>
        <span class="block text-[11px] text-slate-500">Estimasi Tarif</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-black text-orange-500">${formatRupiah(total)}</span>
          <span class="text-xs text-slate-500">/${duration} jam</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="triggerDirections('${spot.id}')" class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer" title="Rute Navigasi GPS">
          <i class="fa-solid fa-diamond-turn-right text-teal-600"></i>
        </button>
        <button onclick="bookThisSpot('${spot.id}')" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer">
          <span>Booking Parkir Ini</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}

function triggerDirections(spotId) {
  const spot = FindParkStore.spots.find(s => s.id === spotId) || FindParkStore.spots[0];
  if (leafletMap) {
    leafletMap.flyTo([spot.lat, spot.lng], 16, { duration: 1 });
  }
  showToast(`Rute navigasi tercepat menuju ${spot.name}: Estimasi 7 menit via akses utama.`);
}

function renderSvgMapFallback() {
  const container = document.getElementById('semarang-map');
  if (!container) return;
  const currentCity = FindParkStore.currentCity || 'Indonesia';
  container.innerHTML = `
    <div class="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
      <svg class="w-full h-full opacity-60" viewBox="0 0 600 400" preserveAspectRatio="none">
        <path d="M 0,100 Q 250,90 600,120" stroke="#cbd5e1" stroke-width="12" fill="none" />
        <path d="M 120,0 L 140,400" stroke="#cbd5e1" stroke-width="8" fill="none" />
        <path d="M 450,0 Q 400,200 470,400" stroke="#cbd5e1" stroke-width="10" fill="none" />
        <path d="M 0,280 L 600,260" stroke="#e2e8f0" stroke-width="6" fill="none" />
        <path d="M 200,320 L 400,120" stroke="#f97316" stroke-width="4" stroke-dasharray="8 6" fill="none" class="car-driving-path" />
      </svg>
      <div class="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        <div class="flex justify-between items-start">
          <div class="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow">
            📍 Peta Interaktif Klaster ${currentCity}
          </div>
          <div class="bg-white px-2 py-1 rounded shadow text-xs text-slate-500">Live IoT On</div>
        </div>
      </div>
    </div>
  `;
}
