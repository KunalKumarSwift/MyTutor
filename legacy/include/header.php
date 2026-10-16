<?php include_once "../include/settings.php" ?>﻿
﻿<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>MyTutor</title>
    <link href="<?php echo baseurl(); ?>include/sitestyle.css" rel="stylesheet" type="text/css" />
</head>
<body>
<!-- Header Start -->
    <table border="0" cellpadding="0" cellspacing="0" id="outerContainer">
        <tr>
            <td id="headerOuter" align="left">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" id="headerContainer">
                    <tr>
                        <td valign="middle" align="left" style="font-family: Arial,Verdana,Sans-Serif,Serif;
                            font-size: 40px;">
                            <label id="headerWebsiteLabelLeft">Online</label><label id="headerWebsiteLabelRight">Tutorial</label>
                        </td>
                        <td valign="bottom" align="right" style="padding-bottom: 5px;">
                            <label id="lblUserName">
                                Welcome <?php if(isset($_SESSION['usertype'])){
                        echo $_SESSION['username']."!!!";
                    }
                    else
                    {
                        echo "Guest!!!";
                    }
?></label>
                           <?php if(isset($_SESSION['usertype'])){?>
                        
                        <a href="<?php echo baseurl()?>Common/Logout.php" style="color:Blue;text-decoration:none;">SignOut</a>
                        <?php
                    }
                    else
                    {
                    ?><a href="<?php echo baseurl()?>guest/Login.php" style="color:Blue;text-decoration:none;">SignIn</a>
                <?php
                    }
                    ?>&nbsp; &nbsp;
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- Header End -->
