<?php

function baseurl() {
    return "http://localhost:70/kunal/MyTutor/";
}

$con = mysql_connect('127.0.0.1:3307', 'root', 'student');
if (!$con) {
    echo '<font color=red>' . mysql_error() . '</font>';
}
$db = mysql_select_db('MyTutor');
if (!$db) {
    echo '<font color=red>' . mysql_error() . '</font>';
}

session_start();
//$_SESSION['usertype']="Operator";
ob_start();

@date_default_timezone_set(@date_default_timezone_get());
?>
