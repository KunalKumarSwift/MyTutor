<?php

if (!isset($_SESSION['usertype']) && $_SESSION['usertype'] != "Operator") {

    header('location:'.baseurl().'guest/login.php');
} elseif (!isset($_SESSION['userid']) && $_SESSION['userid'] == "") {

    header('location:'.baseurl().'guest/login.php');
}
?>
