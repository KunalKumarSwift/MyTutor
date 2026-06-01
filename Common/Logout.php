<?php
require_once '../include/settings.php';
session_destroy();
header('Location: ' . baseurl() . 'guest/Login.php');
exit;
