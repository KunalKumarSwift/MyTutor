<?php
if (!isset($_SESSION['usertype']) || $_SESSION['usertype'] !== 'Operator') {
    header('Location: ' . baseurl() . 'guest/Login.php');
    exit;
}
