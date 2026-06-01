<?php

if ($_SESSION['usertype'] == "Admin") {
    header('location:'.baseurl().'admin/index.php');
} elseif ($_SESSION['usertype'] == "Operator") {
    header('location:'.baseurl().'operator/index.php');
} else {
    header('location:'.baseurl().'guest/login.php');
}
?>
	
