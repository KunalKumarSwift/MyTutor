<?php
if (!isset($_SESSION['usertype']) || $_SESSION['usertype'] !== 'Admin') {
    header('Location: ' . baseurl() . 'guest/Login.php');
    exit;
}
