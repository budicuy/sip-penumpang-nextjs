Gunakan Notifikasi Toast/Snackbar di data user dan penumpang
Masalah: Saat ini, pesan sukses atau error ditampilkan sebagai blok statis di atas halaman. Pengguna mungkin tidak langsung melihatnya, dan pesan tersebut akan hilang jika pengguna me-refresh halaman.

Rekomendasi: Gunakan toast atau snackbar untuk menampilkan notifikasi. Ini adalah notifikasi kecil yang muncul di sudut tengah layar dan hilang setelah beberapa detik. Ini lebih modern dan tidak mengganggu alur kerja pengguna.

ini contoh toast succes :
toast.success('Successfully toasted!')

ini contoh toast error :
toast.error('Something went wrong!')

ini contoh toas promise :
toast.promise(
  saveSettings(settings),
   {
     loading: 'Saving...',
     success: <b>Settings saved!</b>,
     error: <b>Could not save.</b>,
   }
 );