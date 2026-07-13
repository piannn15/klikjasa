<?php
// api.php
if (session_status() == PHP_SESSION_NONE) {
    session_start(); // Wajib untuk menyimpan sesi login pengguna
}

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    // Cek Sesi Pengguna saat Aplikasi Dimuat
    case 'cek_sesi':
        if (isset($_SESSION['user'])) {
            echo json_encode(["status" => "success", "user" => $_SESSION['user']]);
        } else {
            echo json_encode(["status" => "error", "message" => "Belum login"]);
        }
        break;

    // Ambil Data Wilayah untuk Dropdown
    case 'get_cities':
        try {
            $stmt = $pdo->query("SELECT id, name FROM master_cities ORDER BY name ASC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // Registrasi Akun Baru
    case 'register':
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
            echo json_encode(["status" => "error", "message" => "Data pendaftaran tidak lengkap"]);
            exit;
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :pass)");
            $stmt->execute([
                ':name' => $input['name'],
                ':email' => $input['email'],
                ':pass' => $input['password'] // Untuk kesederhanaan sesuai dengan password bawaan Anda
            ]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Email sudah terdaftar atau terjadi error"]);
        }
        break;

    // Login Akun Pengguna
    case 'login':
        $input = json_decode(file_get_contents('php://input'), true);
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND password = :pass");
            $stmt->execute([':email' => $input['email'], ':pass' => $input['password']]);
            $user = $stmt->fetch();

            if ($user) {
                unset($user['password']); // Keamanan: hapus password dari response JSON
                $_SESSION['user'] = $user;
                echo json_encode(["status" => "success", "user" => $user]);
            } else {
                echo json_encode(["status" => "error", "message" => "Email atau kata sandi Anda salah!"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // Keluar Akun (Logout)
    case 'logout':
        session_destroy();
        echo json_encode(["status" => "success"]);
        break;

    // Pengajuan Verifikasi KYC Identitas
    case 'submit_kyc':
        $input = json_decode(file_get_contents('php://input'), true);
        try {
            $stmt = $pdo->prepare("UPDATE users SET nik = :nik, address = :addr, verification_status = 'pending' WHERE id = :id");
            $stmt->execute([
                ':nik' => $input['nik'],
                ':addr' => $input['address'],
                ':id' => $input['user_id']
            ]);
            
            // Perbarui data sesi saat ini
            if (isset($_SESSION['user']) && $_SESSION['user']['id'] == $input['user_id']) {
                $_SESSION['user']['verification_status'] = 'pending';
                $_SESSION['user']['nik'] = $input['nik'];
                $_SESSION['user']['address'] = $input['address'];
            }
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // Ambil Semua Lowongan Kerja
    case 'get_jobs':
        try {
            $stmt = $pdo->query("SELECT j.*, u.name as owner_name FROM jobs j JOIN users u ON j.owner_id = u.id ORDER BY j.created_at DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Aksi tidak valid"]);
        break;
}
?>