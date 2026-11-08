# Your One Entertainment List: Mobile
Aplikasi mobile dengan React Native dan Expo untuk menjelajahi film, serial TV, dan musik.
Pengguna dapat memberi rating dan ulasan sendiri, menyimpan favorit, menandai tontonan,
dan membuat koleksi sendiri. Terhubung ke backend Express dan MongoDB yang sama dengan versi web.

## Teknologi
React Native, Expo, React Navigation menggunakan stack dan tab bawah, expo-secure-store,
expo-audio, react-native-webview.

## Layar
Register, Login, Home (New Release, Trending, Search), Detail (trailer, audio, ulasan),
Favorites, Collections, Collection Detail, Profile. Mendukung mode terang dan gelap.

## Menjalankan
1. Jalankan backend terlebih dahulu
2. Install Expo Go di HP bisa Android atau iOS
3. `npm install`
4. Salin `.env.example` menjadi `.env`, isi `EXPO_PUBLIC_API_URL` dengan alamat API
   contohnya `http://192.168.1.5:5000/api` atau alamat backend online
5. `npx expo start`, lalu scan QR code dengan Expo Go
   pastikan jaringan Wifi sama jika menggunakan backend lokal dan login dengan acc expo yang sama di HP dan PC.

## Alur aplikasi
Tamu dapat melihat Home dan Detail. Favorit, Watched, rating, dan koleksi membutuhkan login.
Token JWT disimpan aman di perangkat, SecureStore, dan dikirim pada setiap permintaan API.

Data film dan serial dari TMDB, musik dari Deezer.
This product uses the TMDB API but is not endorsed or certified by TMDB.