// Data lengkap Provinsi dan Kota/Kabupaten seluruh Indonesia
export interface RegionData {
  province: string;
  cities: string[];
}

export const INDONESIA_REGIONS: RegionData[] = [
  {
    province: "Aceh",
    cities: [
      "Banda Aceh", "Sabang", "Langsa", "Lhokseumawe", "Subulussalam",
      "Aceh Barat", "Aceh Barat Daya", "Aceh Besar", "Aceh Jaya", "Aceh Selatan",
      "Aceh Singkil", "Aceh Tamiang", "Aceh Tengah", "Aceh Tenggara", "Aceh Timur",
      "Aceh Utara", "Bener Meriah", "Bireuen", "Gayo Lues", "Nagan Raya",
      "Pidie", "Pidie Jaya", "Simeulue"
    ]
  },
  {
    province: "Sumatera Utara",
    cities: [
      "Medan", "Binjai", "Gunungsitoli", "Padangsidimpuan", "Pematangsiantar",
      "Sibolga", "Tanjungbalai", "Tebing Tinggi",
      "Asahan", "Batu Bara", "Dairi", "Deli Serdang", "Humbang Hasundutan",
      "Karo", "Labuhanbatu", "Labuhanbatu Selatan", "Labuhanbatu Utara",
      "Langkat", "Mandailing Natal", "Nias", "Nias Barat", "Nias Selatan",
      "Nias Utara", "Padang Lawas", "Padang Lawas Utara", "Pakpak Bharat",
      "Samosir", "Serdang Bedagai", "Simalungun", "Tapanuli Selatan",
      "Tapanuli Tengah", "Tapanuli Utara", "Toba Samosir"
    ]
  },
  {
    province: "Sumatera Barat",
    cities: [
      "Bukittinggi", "Padang", "Padang Panjang", "Pariaman", "Payakumbuh",
      "Sawahlunto", "Solok",
      "Agam", "Dharmasraya", "Kepulauan Mentawai", "Lima Puluh Kota",
      "Padang Pariaman", "Pasaman", "Pasaman Barat", "Pesisir Selatan",
      "Sijunjung", "Solok", "Solok Selatan", "Tanah Datar"
    ]
  },
  {
    province: "Riau",
    cities: [
      "Dumai", "Pekanbaru",
      "Bengkalis", "Indragiri Hilir", "Indragiri Hulu", "Kampar",
      "Kepulauan Meranti", "Kuantan Singingi", "Pelalawan", "Rokan Hilir",
      "Rokan Hulu", "Siak"
    ]
  },
  {
    province: "Kepulauan Riau",
    cities: [
      "Batam", "Tanjungpinang",
      "Bintan", "Karimun", "Kepulauan Anambas", "Lingga", "Natuna"
    ]
  },
  {
    province: "Jambi",
    cities: [
      "Jambi", "Sungai Penuh",
      "Batanghari", "Bungo", "Kerinci", "Merangin", "Muaro Jambi",
      "Sarolangun", "Tanjung Jabung Barat", "Tanjung Jabung Timur", "Tebo"
    ]
  },
  {
    province: "Sumatera Selatan",
    cities: [
      "Lubuklinggau", "Pagar Alam", "Palembang", "Prabumulih",
      "Banyuasin", "Empat Lawang", "Lahat", "Muara Enim", "Musi Banyuasin",
      "Musi Rawas", "Musi Rawas Utara", "Ogan Ilir", "Ogan Komering Ilir",
      "Ogan Komering Ulu", "Ogan Komering Ulu Selatan", "Ogan Komering Ulu Timur",
      "Penukal Abab Lematang Ilir"
    ]
  },
  {
    province: "Bangka Belitung",
    cities: [
      "Pangkal Pinang",
      "Bangka", "Bangka Barat", "Bangka Selatan", "Bangka Tengah",
      "Belitung", "Belitung Timur"
    ]
  },
  {
    province: "Bengkulu",
    cities: [
      "Bengkulu",
      "Bengkulu Selatan", "Bengkulu Tengah", "Bengkulu Utara", "Kaur",
      "Kepahiang", "Lebong", "Mukomuko", "Rejang Lebong", "Seluma"
    ]
  },
  {
    province: "Lampung",
    cities: [
      "Bandar Lampung", "Metro",
      "Lampung Barat", "Lampung Selatan", "Lampung Tengah", "Lampung Timur",
      "Lampung Utara", "Mesuji", "Pesawaran", "Pesisir Barat", "Pringsewu",
      "Tanggamus", "Tulang Bawang", "Tulang Bawang Barat", "Way Kanan"
    ]
  },
  {
    province: "DKI Jakarta",
    cities: [
      "Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan",
      "Jakarta Timur", "Kepulauan Seribu"
    ]
  },
  {
    province: "Jawa Barat",
    cities: [
      "Bandung", "Bekasi", "Bogor", "Cimahi", "Cirebon", "Depok",
      "Sukabumi", "Tasikmalaya",
      "Bandung", "Bandung Barat", "Bekasi", "Bogor", "Ciamis", "Cianjur",
      "Cirebon", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka",
      "Pangandaran", "Purwakarta", "Subang", "Sukabumi", "Sumedang",
      "Tasikmalaya"
    ]
  },
  {
    province: "Banten",
    cities: [
      "Cilegon", "Serang", "Tangerang", "Tangerang Selatan",
      "Lebak", "Pandeglang", "Serang", "Tangerang"
    ]
  },
  {
    province: "Jawa Tengah",
    cities: [
      "Magelang", "Pekalongan", "Salatiga", "Semarang", "Surakarta", "Tegal",
      "Banjarnegara", "Banyumas", "Batang", "Blora", "Boyolali", "Brebes",
      "Cilacap", "Demak", "Grobogan", "Jepara", "Karanganyar", "Kebumen",
      "Kendal", "Klaten", "Kudus", "Magelang", "Pati", "Pekalongan",
      "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Semarang",
      "Sragen", "Sukoharjo", "Tegal", "Temanggung", "Wonogiri", "Wonosobo"
    ]
  },
  {
    province: "DI Yogyakarta",
    cities: [
      "Yogyakarta",
      "Bantul", "Gunungkidul", "Kulon Progo", "Sleman"
    ]
  },
  {
    province: "Jawa Timur",
    cities: [
      "Batu", "Blitar", "Kediri", "Madiun", "Malang", "Mojokerto",
      "Pasuruan", "Probolinggo", "Surabaya",
      "Bangkalan", "Banyuwangi", "Blitar", "Bojonegoro", "Bondowoso",
      "Gresik", "Jember", "Jombang", "Kediri", "Lamongan", "Lumajang",
      "Madiun", "Magetan", "Malang", "Mojokerto", "Nganjuk", "Ngawi",
      "Pacitan", "Pamekasan", "Pasuruan", "Ponorogo", "Probolinggo",
      "Sampang", "Sidoarjo", "Situbondo", "Sumenep", "Trenggalek",
      "Tuban", "Tulungagung"
    ]
  },
  {
    province: "Kalimantan Barat",
    cities: [
      "Pontianak", "Singkawang",
      "Bengkayang", "Kapuas Hulu", "Kayong Utara", "Ketapang", "Kubu Raya",
      "Landak", "Melawi", "Mempawah", "Sambas", "Sanggau", "Sekadau",
      "Sintang"
    ]
  },
  {
    province: "Kalimantan Tengah",
    cities: [
      "Palangka Raya",
      "Barito Selatan", "Barito Timur", "Barito Utara", "Gunung Mas",
      "Katingan", "Kapuas", "Kotawaringin Barat", "Kotawaringin Timur",
      "Lamandau", "Murung Raya", "Pulang Pisau", "Seruyan", "Sukamara"
    ]
  },
  {
    province: "Kalimantan Selatan",
    cities: [
      "Banjarbaru", "Banjarmasin",
      "Balangan", "Banjar", "Barito Kuala", "Hulu Sungai Selatan",
      "Hulu Sungai Tengah", "Hulu Sungai Utara", "Kotabaru", "Tabalong",
      "Tanah Bumbu", "Tanah Laut", "Tapin"
    ]
  },
  {
    province: "Kalimantan Timur",
    cities: [
      "Balikpapan", "Bontang", "Samarinda",
      "Berau", "Kutai Barat", "Kutai Kartanegara", "Kutai Timur",
      "Mahakam Ulu", "Paser", "Penajam Paser Utara"
    ]
  },
  {
    province: "Kalimantan Utara",
    cities: [
      "Tarakan",
      "Bulungan", "Malinau", "Nunukan", "Tana Tidung"
    ]
  },
  {
    province: "Sulawesi Utara",
    cities: [
      "Bitung", "Kotamobagu", "Manado", "Tomohon",
      "Bolaang Mongondow", "Bolaang Mongondow Selatan", "Bolaang Mongondow Timur",
      "Bolaang Mongondow Utara", "Kepulauan Sangihe", "Kepulauan Siau Tagulandang Biaro",
      "Kepulauan Talaud", "Minahasa", "Minahasa Selatan", "Minahasa Tenggara",
      "Minahasa Utara"
    ]
  },
  {
    province: "Sulawesi Tengah",
    cities: [
      "Palu",
      "Banggai", "Banggai Kepulauan", "Banggai Laut", "Buol", "Donggala",
      "Morowali", "Morowali Utara", "Parigi Moutong", "Poso", "Sigi",
      "Tojo Una-Una", "Tolitoli"
    ]
  },
  {
    province: "Sulawesi Selatan",
    cities: [
      "Makassar", "Palopo", "Parepare",
      "Bantaeng", "Barru", "Bone", "Bulukumba", "Enrekang", "Gowa",
      "Jeneponto", "Kepulauan Selayar", "Luwu", "Luwu Timur", "Luwu Utara",
      "Maros", "Pangkajene dan Kepulauan", "Pinrang", "Sidenreng Rappang",
      "Sinjai", "Soppeng", "Takalar", "Tana Toraja", "Toraja Utara", "Wajo"
    ]
  },
  {
    province: "Sulawesi Tenggara",
    cities: [
      "Bau-Bau", "Kendari",
      "Bombana", "Buton", "Buton Selatan", "Buton Tengah", "Buton Utara",
      "Kolaka", "Kolaka Timur", "Kolaka Utara", "Konawe", "Konawe Kepulauan",
      "Konawe Selatan", "Konawe Utara", "Muna", "Muna Barat", "Wakatobi"
    ]
  },
  {
    province: "Gorontalo",
    cities: [
      "Gorontalo",
      "Boalemo", "Bone Bolango", "Gorontalo", "Gorontalo Utara", "Pohuwato"
    ]
  },
  {
    province: "Sulawesi Barat",
    cities: [
      "Mamuju",
      "Majene", "Mamasa", "Mamuju", "Mamuju Tengah", "Pasangkayu", "Polewali Mandar"
    ]
  },
  {
    province: "Bali",
    cities: [
      "Denpasar",
      "Badung", "Bangli", "Buleleng", "Gianyar", "Jembrana", "Karangasem",
      "Klungkung", "Tabanan"
    ]
  },
  {
    province: "Nusa Tenggara Barat",
    cities: [
      "Bima", "Mataram",
      "Bima", "Dompu", "Lombok Barat", "Lombok Tengah", "Lombok Timur",
      "Lombok Utara", "Sumbawa", "Sumbawa Barat"
    ]
  },
  {
    province: "Nusa Tenggara Timur",
    cities: [
      "Kupang",
      "Alor", "Belu", "Ende", "Flores Timur", "Kupang", "Lembata",
      "Malaka", "Manggarai", "Manggarai Barat", "Manggarai Timur", "Nagekeo",
      "Ngada", "Rote Ndao", "Sabu Raijua", "Sikka", "Sumba Barat",
      "Sumba Barat Daya", "Sumba Tengah", "Sumba Timur", "Timor Tengah Selatan",
      "Timor Tengah Utara"
    ]
  },
  {
    province: "Maluku",
    cities: [
      "Ambon", "Tual",
      "Buru", "Buru Selatan", "Kepulauan Aru", "Maluku Barat Daya",
      "Maluku Tengah", "Maluku Tenggara", "Maluku Tenggara Barat",
      "Seram Bagian Barat", "Seram Bagian Timur"
    ]
  },
  {
    province: "Maluku Utara",
    cities: [
      "Ternate", "Tidore Kepulauan",
      "Halmahera Barat", "Halmahera Selatan", "Halmahera Tengah",
      "Halmahera Timur", "Halmahera Utara", "Kepulauan Sula", "Pulau Morotai",
      "Pulau Taliabu"
    ]
  },
  {
    province: "Papua",
    cities: [
      "Jayapura",
      "Asmat", "Biak Numfor", "Boven Digoel", "Deiyai", "Dogiyai",
      "Intan Jaya", "Jayapura", "Jayawijaya", "Keerom", "Kepulauan Yapen",
      "Lanny Jaya", "Mamberamo Raya", "Mamberamo Tengah", "Mappi", "Merauke",
      "Mimika", "Nabire", "Nduga", "Paniai", "Peg Bintang", "Puncak",
      "Puncak Jaya", "Sarmi", "Supiori", "Tolikara", "Waropen", "Yahukimo",
      "Yalimo"
    ]
  },
  {
    province: "Papua Barat",
    cities: [
      "Manokwari", "Sorong",
      "Fakfak", "Kaimana", "Manokwari", "Manokwari Selatan", "Maybrat",
      "Pegunungan Arfak", "Raja Ampat", "Sorong", "Sorong Selatan",
      "Tambrauw", "Teluk Bintuni", "Teluk Wondama"
    ]
  },
  {
    province: "Papua Selatan",
    cities: [
      "Merauke",
      "Asmat", "Boven Digoel", "Mappi"
    ]
  },
  {
    province: "Papua Tengah",
    cities: [
      "Nabire",
      "Deiyai", "Dogiyai", "Intan Jaya", "Mimika", "Nabire", "Paniai",
      "Puncak", "Puncak Jaya"
    ]
  },
  {
    province: "Papua Pegunungan",
    cities: [
      "Wamena",
      "Jayawijaya", "Lanny Jaya", "Mamberamo Tengah", "Nduga", "Peg Bintang",
      "Tolikara", "Yahukimo", "Yalimo"
    ]
  },
  {
    province: "Papua Barat Daya",
    cities: [
      "Sorong",
      "Maybrat", "Raja Ampat", "Sorong", "Sorong Selatan", "Tambrauw"
    ]
  }
];

// Helper: get all provinces
export const getAllProvinces = (): string[] => 
  INDONESIA_REGIONS.map(r => r.province);

// Helper: get cities for a province
export const getCitiesForProvince = (province: string): string[] => {
  const region = INDONESIA_REGIONS.find(r => r.province === province);
  // Deduplicate cities
  return region ? [...new Set(region.cities)].sort() : [];
};
