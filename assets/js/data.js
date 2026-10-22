// FindPark Shared Store & State Management
const FindParkStore = {
  // Current user info
  user: {
    name: 'Angelica Prameswari',
    phone: '+62 812-3456-7890',
    email: 'angelica.prameswari@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    balances: {
      gopay: 150000,
      dana: 85000,
      ovo: 50000
    }
  },

  // Vehicles list
  vehicles: [
    {
      id: 'v1',
      plate: 'B 1256 AY',
      name: 'Honda HR-V Putih',
      type: 'SUV',
      isPrimary: true
    },
    {
      id: 'v2',
      plate: 'H 8421 KT',
      name: 'Toyota Raize Hitam',
      type: 'Crossover',
      isPrimary: false
    }
  ],

  activeVehiclePlate: 'B 1256 AY',

  // Mall Parking spots
  spots: [
    {
      id: 'dp-mall-g3',
      name: 'DP Mall Semarang – G3',
      shortName: 'DP Mall G3',
      address: 'Jl. Pemuda No.150, Sekayu, Semarang Tengah',
      area: 'Area Sekayu',
      subLocation: 'Lantai G3, Area B (Dekat Pintu Masuk Timur / Lobby XXI)',
      slotCode: 'G3-B14',
      lat: -6.9826,
      lng: 110.4124,
      ratePerHour: 5000,
      rating: 4.8,
      reviewsCount: 342,
      totalSlots: 120,
      availableSlots: 42,
      openingHours: 'Buka s/d 20:00 WIB',
      distance: '600m (7 mnt)',
      vehicleType: 'Mobil',
      statusTag: '42 Slot Kosong',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagBadge: 'PILIHAN TERBAIK • REKOMENDASI',
      badgeClass: 'bg-amber-500 text-white',
      syncGate: true,
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'the-park-a34',
      name: 'The Park Mall – A34',
      shortName: 'The Park (38)',
      address: 'Jl. Madukoro Raya No.10, Tawangsari, Semarang Barat',
      area: 'Tawangsari',
      subLocation: 'Lantai Dasar A34 (Dekat Main Lobby)',
      slotCode: 'A34-08',
      lat: -6.9692,
      lng: 110.3985,
      ratePerHour: 5000,
      rating: 4.7,
      reviewsCount: 198,
      totalSlots: 100,
      availableSlots: 38,
      openingHours: 'Buka 24 Jam',
      distance: '1.8 km (12 mnt)',
      vehicleType: 'Mobil',
      statusTag: '38 Slot Tersedia',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagBadge: 'Area VIP Dekat Lobby',
      badgeClass: 'bg-blue-600 text-white',
      syncGate: true,
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'mall-paragon-a5',
      name: 'Mall Paragon – A5',
      shortName: 'Paragon (55)',
      address: 'Jl. Pemuda No.118, Sekayu, Semarang Tengah',
      area: 'Sekayu',
      subLocation: 'Lantai A5 / Basement 1 (Dekat Hypermart)',
      slotCode: 'A5-22',
      lat: -6.9795,
      lng: 110.4150,
      ratePerHour: 5000,
      rating: 4.9,
      reviewsCount: 420,
      totalSlots: 150,
      availableSlots: 55,
      openingHours: 'Buka s/d 22:00 WIB',
      distance: '850m (9 mnt)',
      vehicleType: 'Mobil',
      statusTag: '55 Slot Tersedia',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagBadge: 'Sensor Kamera On',
      badgeClass: 'bg-cyan-600 text-white',
      syncGate: true,
      image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'mall-ciputra-b14',
      name: 'Mall Ciputra – B14',
      shortName: 'Ciputra (15)',
      address: 'Kawasan Simpang Lima No.1, Pekunden, Semarang',
      area: 'Simpang Lima',
      subLocation: 'Lantai B14 (Dekat Pintu Keluar Selatan)',
      slotCode: 'B14-04',
      lat: -6.9928,
      lng: 110.4233,
      ratePerHour: 5000,
      rating: 4.6,
      reviewsCount: 215,
      totalSlots: 80,
      availableSlots: 15,
      openingHours: 'Buka s/d 22:00 WIB',
      distance: '2.4 km (15 mnt)',
      vehicleType: 'Mobil',
      statusTag: 'Hampir Penuh (15 Sisa)',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
      tagBadge: 'Tersedia EV Charger',
      badgeClass: 'bg-teal-700 text-white',
      syncGate: true,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'
    }
  ],

  // Current active booking configuration
  currentBooking: {
    spotId: 'dp-mall-g3',
    date: '2025-05-24',
    dateLabel: 'Hari Ini, 24 Mei 2025',
    isWorkDay: true,
    time: '12:00',
    durationHours: 1,
    vehiclePlate: 'B 1256 AY',
    bookerName: 'Angelica Prameswari',
    bookerPhone: '+62 812-3456-7890',
    bookerEmail: 'angelica.prameswari@gmail.com',
    addons: {
      valet: false,
      ev: false,
      carwash: false
    },
    promoDiscount: 1000,
    promoCode: 'PENGGUNABARU',
    paymentMethod: 'gopay',
    orderNumber: '#FPK-78829',
    bookingCode: 'G3 - 123456',
    isPaid: false
  },

  // Historical orders
  transactions: [
    {
      id: 'FPK-78829',
      spotName: 'DP Mall Semarang – Slot G3',
      slotCode: 'G3-12',
      date: 'Jumat, 1 Agustus 2025',
      timeSlot: '12:00 – 13:00 WIB',
      vehiclePlate: 'B 1256 AY',
      amount: 5000,
      paymentMethod: 'GoPay',
      status: 'Aktif',
      statusClass: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'FPK-71042',
      spotName: 'Pollux Mall Paragon – Slot A5',
      slotCode: 'A5-08',
      date: 'Rabu, 20 Mei 2025',
      timeSlot: '18:30 – 21:30 WIB (3 Jam)',
      vehiclePlate: 'B 1256 AY',
      amount: 15000,
      paymentMethod: 'GoPay',
      status: 'Selesai',
      statusClass: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'FPK-68901',
      spotName: 'The Park Mall – Slot A34',
      slotCode: 'A34-11',
      date: 'Minggu, 11 Mei 2025',
      timeSlot: '14:00 – 16:00 WIB (2 Jam)',
      vehiclePlate: 'H 8421 KT',
      amount: 10000,
      paymentMethod: 'DANA',
      status: 'Selesai',
      statusClass: 'bg-slate-100 text-slate-700'
    }
  ],

  // NEW MENU DATA: Find My Car Tracker
  carTracker: {
    plate: 'B 1256 AY',
    carName: 'Honda HR-V Putih (SUV)',
    mallName: 'DP Mall Semarang',
    pillar: 'Tiang G3 - B14',
    floor: 'Lantai G3, Area B (Dekat Lobby Timur XXI)',
    parkedSince: '12:00 WIB',
    elapsedSeconds: 2894, // ~48 mins
    distanceMeters: 45,
    walkingTimeMinutes: 1,
    batteryStatus: 'Good (12.6V)',
    hazardActive: false
  },

  // NEW MENU DATA: Langganan Pass Bulanan
  subscriptionPlans: [
    {
      id: 'sub-all-mall',
      name: 'All-Mall Semarang Pass',
      badge: 'TERPOPULER',
      price: 350000,
      period: 'Bulan',
      description: 'Akses parkir unlimited tanpa bayar berulang di seluruh mall rekanan FindPark di Semarang.',
      mallsIncluded: ['DP Mall', 'Mall Paragon', 'The Park', 'Mall Ciputra'],
      features: [
        'Akses bebas keluar masuk gerbang via Auto-Pass plat nomor',
        'Jaminan kuota slot khusus jam sibuk akhir pekan',
        'Diskon 50% layanan Valet VIP',
        'Notifikasi reminder slot terdekat via WhatsApp'
      ],
      isCurrent: true
    },
    {
      id: 'sub-dp-mall',
      name: 'Dedicated Slot DP Mall G3',
      badge: 'KHUSUS KANTOR',
      price: 250000,
      period: 'Bulan',
      description: 'Slot parkir pribadi yang selalu tertahan atas nama plat kendaraan Anda 24/7.',
      mallsIncluded: ['DP Mall Semarang (Lantai G3)'],
      features: [
        'Slot privat dengan plang nama plat Anda',
        'Akses pintu masuk VIP Gate Timur langsung lift',
        'Gratis 2x cuci mobil eksterior per bulan',
        'Layanan bantuan darurat aki & ban prioritas'
      ],
      isCurrent: false
    },
    {
      id: 'sub-ev-pass',
      name: 'Eco EV Unlimited Charging',
      badge: 'MOBIL LISTRIK',
      price: 450000,
      period: 'Bulan',
      description: 'Paket komplit parkir harian + gratis pengisian daya baterai mobil listrik (CCS2 & Type 2).',
      mallsIncluded: ['Semua Stasiun EV Partner Semarang'],
      features: [
        'Gratis kuota pengisian daya hingga 150 kWh/bulan',
        'Prioritas antrean charging port via aplikasi',
        'Free reservasi slot khusus EV',
        'Laporan efisiensi energi & penghematan emisi'
      ],
      isCurrent: false
    }
  ],

  // NEW MENU DATA: EV Charging Stations in Semarang
  evStations: [
    {
      id: 'ev-dp-mall',
      name: 'DP Mall Semarang EV Hub',
      address: 'Lantai Dasar G3 (Area Pilar B12-B14)',
      power: '22 kW - 50 kW (Fast Charging)',
      connectors: [
        { type: 'CCS2 (DC Fast)', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' },
        { type: 'CCS2 (DC Fast)', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' },
        { type: 'Type 2 (AC)', status: 'Digunakan (Hyundai Ioniq 5)', class: 'text-amber-600 bg-amber-50' },
        { type: 'Type 2 (AC)', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' }
      ],
      ratePerKwh: 2466,
      openStatus: '24 Jam Buka'
    },
    {
      id: 'ev-the-park',
      name: 'The Park Mall Supercharger',
      address: 'Area Parkir Timur Dekat Starbuck',
      power: '60 kW (Ultra Fast)',
      connectors: [
        { type: 'CCS2 60kW', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' },
        { type: 'CCS2 60kW', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' }
      ],
      ratePerKwh: 2600,
      openStatus: '10:00 – 22:00 WIB'
    },
    {
      id: 'ev-paragon',
      name: 'Pollux Mall Paragon EV Station',
      address: 'Basement 1 Area VIP',
      power: '22 kW (AC Fast)',
      connectors: [
        { type: 'Type 2 AC', status: 'Tersedia', class: 'text-emerald-600 bg-emerald-50' },
        { type: 'Type 2 AC', status: 'Digunakan (Wuling Binguo)', class: 'text-amber-600 bg-amber-50' }
      ],
      ratePerKwh: 2466,
      openStatus: '10:00 – 22:00 WIB'
    }
  ]
};

// Format currency IDR
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}
