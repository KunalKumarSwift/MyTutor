<?php
/**
 * Run once after `docker compose up` to create the admin account:
 *   docker compose exec app php /var/www/html/database/seed.php
 *
 * Default credentials: admin / Admin@123
 */
require_once __DIR__ . '/../include/settings.php';

$stmt = $pdo->prepare("SELECT COUNT(*) FROM tbluser WHERE usrId = 'admin'");
$stmt->execute();
if ((int)$stmt->fetchColumn() > 0) {
    echo "Admin user already exists.\n";
    exit;
}

$hash = password_hash('Admin@123', PASSWORD_BCRYPT);
$stmt = $pdo->prepare(
    "INSERT INTO tbluser (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
     VALUES (?,?,'Admin','Active','Administrator','1990-01-01','Male','admin@mytutor.com','Admin Address','0000000000')"
);
$stmt->execute(['admin', $hash]);
echo "Admin user created.\nUsername: admin\nPassword: Admin@123\n";
