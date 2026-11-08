# Your One Entertainment List: Web

Aplikasi web (React) untuk menjelajahi film, serial TV, dan musik. Pengguna dapat
memberi rating dan ulasan, menyimpan favorit, menandai tontonan, dan membuat koleksi.

## Teknologi
React 19, Vite, React Router, lucide-react. Terhubung ke backend Express dan MongoDB.

## Halaman
Register, Login, Home (New Release, Trending, Search), Detail (trailer, ulasan),
Favorites, Collections, Collection Detail, Profile. Mendukung mode terang dan gelap yang dapat diganti dimana saja.

## Menjalankan
1. Jalankan backend terlebih dahulu
2. `npm install`
3. Salin `.env.example` menjadi `.env` isi `VITE_API_URL` dengan alamat API
4. `npm run dev`, lalu buka http://localhost:5173

## Build produksi
`npm run build` menghasilkan folder `dist`.

## Alur aplikasi
Tamu dapat melihat Home dan Detail. Favorit, Watched, rating, dan koleksi
membutuhkan login. Token JWT disimpan di localStorage dan dikirim pada setiap
permintaan ke API.

Data film dan serial dari TMDB, musik dari Deezer.
This product uses the TMDB API but is not endorsed or certified by TMDB.