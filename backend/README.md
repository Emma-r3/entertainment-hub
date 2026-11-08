# Your One Entertainment List: Backend

REST API untuk aplikasi Your One Entertainment List web dan mobile.

## Teknologi
Node.js, Express 5, MongoDB Atlas (Mongoose), JWT, bcrypt.
Sumber data konten: TMDB API (film, serial) dan Deezer API (musik).
This product uses the TMDB API but is not endorsed or certified by TMDB.

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan isi nilainya
3. `npm run dev` atau `npm start`

## Format autentikasi
Endpoint bertanda "Login" membutuhkan header:
`Authorization: Bearer <token>`

## Endpoint

| Method | Endpoint | Keterangan | Login |
|---|---|---|---|
| GET | /api/health | Cek status server | - |
| POST | /api/auth/register | Daftar | - |
| POST | /api/auth/login | Masuk, mengembalikan token | - |
| GET | /api/auth/me | Data profil | Ya |
| GET | /api/auth/stats | Statistik profil | Ya |
| PATCH | /api/auth/theme | Simpan tema light/dark | Ya |
| GET | /api/content/trending/:type | Konten populer (movie, tv, music) | - |
| GET | /api/content/new/:type | Rilisan terbaru | - |
| GET | /api/content/search?q=&type= | Pencarian (type: all, movie, tv, music) | - |
| GET | /api/content/:type/:id | Detail dan trailer | - |
| GET | /api/reviews/:type/:id | Ulasan dan rata-rata rating | - |
| GET | /api/reviews/summary?type=&ids= | Rata-rata rating banyak konten | - |
| POST | /api/reviews | Tambah ulasan | Ya |
| PUT | /api/reviews/:id | Ubah ulasan sendiri | Ya |
| DELETE | /api/reviews/:id | Hapus ulasan sendiri | Ya |
| GET | /api/favorites | Daftar favorit | Ya |
| POST | /api/favorites | Tambah favorit | Ya |
| DELETE | /api/favorites/:id | Hapus favorit | Ya |
| GET | /api/watched | Daftar sudah ditonton | Ya |
| GET | /api/watched/ids | Daftar ID ditonton (format type:id) | Ya |
| POST | /api/watched/toggle | Tandai / batalkan ditonton | Ya |
| GET | /api/collections | Daftar koleksi | Ya |
| POST | /api/collections | Buat koleksi | Ya |
| GET | /api/collections/:id | Isi satu koleksi | Ya |
| PUT | /api/collections/:id | Ubah nama koleksi | Ya |
| DELETE | /api/collections/:id | Hapus koleksi | Ya |
| POST | /api/collections/:id/items | Tambah konten ke koleksi | Ya |
| DELETE | /api/collections/:id/items/:type/:contentId | Hapus konten dari koleksi | Ya |

## Database (MongoDB)
Collection: `users`, `reviews`, `favorites`, `watched`, `collections`.

## Keamanan
Password dihash dengan bcrypt, autentikasi JWT (7 hari), validasi input,
helmet, rate limit pada login/register, dan setiap data personal difilter
berdasarkan userId sehingga tidak bisa diakses user lain.