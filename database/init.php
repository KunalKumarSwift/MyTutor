<?php
/**
 * One-time setup — creates the SQLite database, all tables, and the admin user.
 *
 * Usage:
 *   php database/init.php
 *
 * Default login after setup:
 *   Username : admin
 *   Password : Admin@123
 */
if (!extension_loaded('pdo_sqlite')) {
    die("Error: pdo_sqlite extension is not enabled in your PHP installation.\n");
}

$dbFile = __DIR__ . '/mytutor.db';

if (file_exists($dbFile)) {
    echo "Database already exists at: {$dbFile}\n";
    echo "Delete it and re-run this script to start fresh.\n";
    exit;
}

$pdo = new PDO('sqlite:' . $dbFile);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

$pdo->exec("
CREATE TABLE tbluser (
    usrId       TEXT NOT NULL PRIMARY KEY,
    usrPwd      TEXT NOT NULL,
    usrType     TEXT NOT NULL,
    usrStatus   TEXT NOT NULL DEFAULT 'Active',
    usrName     TEXT NOT NULL,
    usrDOB      TEXT DEFAULT NULL,
    usrGender   TEXT DEFAULT NULL,
    usrEmail    TEXT DEFAULT NULL,
    usrAddress  TEXT DEFAULT NULL,
    usrMobile   TEXT DEFAULT NULL
);

CREATE TABLE tblcategory (
    categoryId     INTEGER PRIMARY KEY,
    categoryTitle  TEXT    NOT NULL,
    categoryDesc   TEXT    DEFAULT NULL,
    categoryStatus TEXT    NOT NULL DEFAULT 'Active'
);

CREATE TABLE tbldifficultylevel (
    difficultyLevelId     INTEGER PRIMARY KEY,
    difficultyLevelTitle  TEXT    NOT NULL,
    difficultyLevelDesc   TEXT    DEFAULT NULL,
    difficultyLevelStatus TEXT    NOT NULL DEFAULT 'Active'
);

CREATE TABLE tbltutorial (
    tutorialId            INTEGER PRIMARY KEY,
    tutorialTitle         TEXT    NOT NULL,
    tutorialDesc          TEXT    DEFAULT NULL,
    categoryId            INTEGER NOT NULL,
    difficultyLevelId     INTEGER NOT NULL,
    tutorialPrerequisites TEXT    DEFAULT NULL,
    tutorialCreateDate    TEXT    DEFAULT (datetime('now')),
    tutorialStatus        TEXT    NOT NULL DEFAULT 'Active',
    usrId                 TEXT    NOT NULL,
    FOREIGN KEY (categoryId)        REFERENCES tblcategory(categoryId),
    FOREIGN KEY (difficultyLevelId) REFERENCES tbldifficultylevel(difficultyLevelId),
    FOREIGN KEY (usrId)             REFERENCES tbluser(usrId)
);
");

$hash = password_hash('Admin@123', PASSWORD_BCRYPT);
$stmt = $pdo->prepare(
    "INSERT INTO tbluser
     (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
     VALUES (?,?,'Admin','Active','Administrator','1990-01-01','Male','admin@mytutor.com','Admin Address','0000000000')"
);
$stmt->execute(['admin', $hash]);

echo "Database created: {$dbFile}\n";
echo "Admin account ready.\n";
echo "  Username : admin\n";
echo "  Password : Admin@123\n";
