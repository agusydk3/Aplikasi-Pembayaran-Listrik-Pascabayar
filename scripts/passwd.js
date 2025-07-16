const bcrypt = require('bcryptjs');

// Password yang ingin di-hash
const password = '123456'; // atau password lain yang ingin Anda gunakan

// Generate salt (10-12 adalah nilai yang umum digunakan)
const saltRounds = 10;

// Hash password
bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('Password asli:', password);
    console.log('Password yang di-hash:', hash);
    
    // Verifikasi (opsional, untuk memastikan hash berfungsi)
    bcrypt.compare(password, hash, function(err, result) {
        if (err) {
            console.error('Error verifikasi:', err);
            return;
        }
        console.log('Verifikasi berhasil:', result); // Seharusnya true
    });
});