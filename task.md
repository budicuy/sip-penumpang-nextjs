Gunakan Server Actions untuk Mutasi Data Penumpang

Masalah: Saat ini, Anda menggunakan API Routes untuk operasi POST, PUT, dan DELETE yang dipanggil dari form di sisi klien ('use client'). Ini menciptakan satu lapisan request jaringan tambahan.

Saran: Untuk Next.js 15, pertimbangkan menggunakan Server Actions. Ini memungkinkan fungsi yang berjalan di server dipanggil langsung dari komponen klien tanpa perlu membuat API endpoint secara manual. Kodenya menjadi lebih sederhana, dan berpotensi mengurangi latensi.