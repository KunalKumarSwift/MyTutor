<?php
if (isset($_SESSION['usertype'])) {
    $dest = $_SESSION['usertype'] === 'Admin' ? 'admin/index.php' : 'operator/index.php';
    header('Location: ' . baseurl() . $dest);
    exit;
}
