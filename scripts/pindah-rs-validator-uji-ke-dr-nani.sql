-- =====================================================================
-- Pindahkan RS dari akun uji coba validator1-5 ke akun dr. Nani
-- Hanya RS yang BELUM dipegang akun dokter mana pun.
-- RS yang sudah ada di akun dokter lain dibiarkan apa adanya.
--
-- Jalankan di Turso:  turso db shell <NAMA_DATABASE>
-- Langkah 0-1 hanya membaca (aman). Langkah 2 yang mengubah data.
-- =====================================================================

-- 0. Cari username akun dr. Nani (salin persis ke langkah 2)
SELECT id, username, role
FROM admins
WHERE role = 'validator'
ORDER BY username;

-- 1a. PREVIEW: RS yang AKAN dipindah ke dr. Nani
SELECT va.validator_username AS akun_uji, va.hospital_code
FROM validator_assignments va
WHERE LOWER(va.validator_username) IN ('validator1','validator2','validator3','validator4','validator5')
  AND NOT EXISTS (
    SELECT 1 FROM validator_assignments o
    WHERE o.hospital_code = va.hospital_code
      AND LOWER(o.validator_username) NOT IN ('validator1','validator2','validator3','validator4','validator5')
  )
ORDER BY va.validator_username, va.hospital_code;

-- 1b. PREVIEW: RS yang DILEWATI karena sudah dipegang dokter lain
SELECT va.validator_username AS akun_uji, va.hospital_code, o.validator_username AS sudah_dipegang
FROM validator_assignments va
JOIN validator_assignments o
  ON o.hospital_code = va.hospital_code
 AND LOWER(o.validator_username) NOT IN ('validator1','validator2','validator3','validator4','validator5')
WHERE LOWER(va.validator_username) IN ('validator1','validator2','validator3','validator4','validator5')
ORDER BY va.hospital_code;

-- 2. EKSEKUSI — ganti 'USERNAME_DR_NANI' dengan hasil langkah 0.
--    Baris di-UPDATE (bukan hapus + insert) supaya id-nya tetap,
--    sehingga seeder saat server restart (INSERT OR IGNORE) tidak
--    mengembalikan RS ini ke akun validator uji.
WITH target AS (SELECT LOWER(TRIM('USERNAME_DR_NANI')) AS u)
UPDATE validator_assignments
SET validator_username = (SELECT u FROM target)
WHERE LOWER(validator_username) IN ('validator1','validator2','validator3','validator4','validator5')
  AND EXISTS (SELECT 1 FROM admins a, target t WHERE LOWER(a.username) = t.u)  -- batal kalau username salah ketik
  AND NOT EXISTS (
    SELECT 1 FROM validator_assignments o
    WHERE o.hospital_code = validator_assignments.hospital_code
      AND LOWER(o.validator_username) NOT IN ('validator1','validator2','validator3','validator4','validator5')
  )
  AND id = (  -- kalau 1 RS ada di 2 akun uji, cukup pindahkan satu
    SELECT MIN(d.id) FROM validator_assignments d
    WHERE d.hospital_code = validator_assignments.hospital_code
      AND LOWER(d.validator_username) IN ('validator1','validator2','validator3','validator4','validator5')
  );

-- 3. CEK HASIL: jumlah RS per akun
SELECT validator_username, COUNT(*) AS jumlah_rs
FROM validator_assignments
GROUP BY validator_username
ORDER BY validator_username;
