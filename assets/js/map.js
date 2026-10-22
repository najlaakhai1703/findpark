// Interactive Semarang Parking Map Handler
let leafletMap = null;
let mapMarkers = [];

function initParkingMap() {
  const mapContainer = document.getElementById('semarang-map');
  if (!mapContainer) return;

  // Center on Semarang Center (around Simpang Lima & Pemuda)
  const defaultCenter = [-6.9826, 110.4150];

  try {
    if (typeof L !== 'undefined') {
      if (leafletMap) {
        leafletMap.remove();
      }

      leafletMap = L.map('semarang-map', {
        zoomControl: false
      }).setView(defaultCenter, 14);

      // Clean CartoDB Voyager tiles (modern, soft, clean light theme matching Figma)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletMap);

      // Add custom zoom control in top right matching Figma
      L.control.zoom({ position: 'topright' }).addTo(leafletMap);

      // Add markers for all spots
      FindParkStore.spots.forEach(spot => {
        const isSelected = spot.id === FindParkStore.currentBooking.spotId;
        
        // Custom HTML marker matching Figma design pill
        const markerHtml = `
          <div class="relative cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border-2 ${
              isSelected 
                ? 'bg-orange-500 text-white border-white ring-4 ring-orange-200' 
                : 'bg-white text-slate-800 border-teal-600 hover:border-orange-500'
            }">
              <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}"></span>
              <span>${spot.shortName}</span>
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] ${
              isSelected ? 'border-t-orange-500' : 'border-t-white'
            } mx-auto"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-map-pin',
          iconSize: [110, 36],
          iconAnchor: [55, 36]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(leafletMap);

        marker.on('click', () => {
          selectSpotFromMap(spot.id);
        });

        mapMarkers.push({ id: spot.id, marker });
      });

      // Add simulated GPS dashed route from user to DP Mall (600m)
      const routePoints = [
        [-6.9860, 110.4160], // User location
        [-6.9840, 110.4140],
        [-6.9826, 110.4124]  // DP Mall
      ];

      L.polyline(routePoints, {
        color: '#f97316',
        weight: 4,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(leafletMap);

      // User location circle marker
      L.circleMarker([-6.9860, 110.4160], {
        radius: 8,
        fillColor: '#0ea5e9',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(leafletMap);

    } else {
      // Fallback SVG map if Leaflet is not available
      renderSvgMapFallback();
    }
  } catch (e) {
    console.warn('Leaflet error, using SVG fallback', e);
    renderSvgMapFallback();
  }
}

function updateMapSelection(selectedId) {
  if (leafletMap && mapMarkers.length) {
    const target = FindParkStore.spots.find(s => s.id === selectedId);
    if (target) {
      leafletMap.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
    }
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
          Tujuan Terpilih • ${spot.area}
        </span>
        <h4 class="text-lg font-bold text-slate-900">${spot.name}</h4>
      </div>
      <div class="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
        <i class="fa-solid fa-circle-check"></i>
      </div>
    </div>

    <div class="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-slate-600 font-medium"><i class="fa-solid fa-car text-teal-600 mr-1"></i> Kapasitas Lantai G3</span>
        <span class="font-bold text-teal-700">${spot.availableSlots} Slot Kosong (65% Terisi)</span>
      </div>
      <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div class="bg-teal-600 h-full rounded-full" style="width: 65%"></div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center text-xs mb-4">
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase">Total Slot</span>
        <strong class="text-slate-800 text-sm">${spot.totalSlots}</strong>
      </div>
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase">Tersedia</span>
        <strong class="text-emerald-600 text-sm">${spot.availableSlots}</strong>
      </div>
      <div class="bg-white p-2 rounded-lg border border-slate-200">
        <span class="block text-slate-400 text-[10px] uppercase">Sensor Siap</span>
        <strong class="text-orange-500 text-sm font-bold">Aktif</strong>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
      <div>
        <span class="block text-[11px] text-slate-500">Total Tarif Estimasi</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-black text-orange-500">${formatRupiah(total)}</span>
          <span class="text-xs text-slate-500">/${duration} jam</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="triggerDirections('${spot.id}')" class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition" title="Rute Navigasi">
          <i class="fa-solid fa-diamond-turn-right text-teal-600"></i>
        </button>
        <button onclick="bookThisSpot('${spot.id}')" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition">
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
  showToast(`Rute navigasi tercepat menuju ${spot.name}: Estimasi 7 menit via Jl. Pemuda.`);
}

function renderSvgMapFallback() {
  const container = document.getElementById('semarang-map');
  if (!container) return;
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
            📍 Peta Interaktif Kawasan Semarang Tengah
          </div>
          <div class="bg-white px-2 py-1 rounded shadow text-xs text-slate-500">Live 4 Lokasi Aktif</div>
        </div>
      </div>
    </div>
  `;
}
