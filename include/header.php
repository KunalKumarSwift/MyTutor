<?php require_once __DIR__ . '/settings.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyTutor</title>
    <link href="<?= h(baseurl()) ?>include/sitestyle.css" rel="stylesheet" type="text/css">
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" id="outerContainer">
    <tr>
        <td id="headerOuter" align="left">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" id="headerContainer">
                <tr>
                    <td valign="middle" align="left"
                        style="font-family:Arial,Verdana,Sans-Serif,Serif;font-size:40px;">
                        <label id="headerWebsiteLabelLeft">Online</label><label
                            id="headerWebsiteLabelRight">Tutorial</label>
                    </td>
                    <td valign="bottom" align="right" style="padding-bottom:5px;">
                        <label id="lblUserName">Welcome <?php
                        if (isset($_SESSION['usertype'])) {
                            echo h($_SESSION['username']) . '!!!';
                        } else {
                            echo 'Guest!!!';
                        }
                        ?></label>
                        <?php if (isset($_SESSION['usertype'])): ?>
                            <a href="<?= h(baseurl()) ?>Common/Logout.php"
                               style="color:Blue;text-decoration:none;">SignOut</a>
                        <?php else: ?>
                            <a href="<?= h(baseurl()) ?>guest/Login.php"
                               style="color:Blue;text-decoration:none;">SignIn</a>
                        <?php endif; ?>
                        &nbsp;&nbsp;
                    </td>
                </tr>
            </table>
        </td>
    </tr>
