<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php// include "checksession.php";?>
<tr>
            <td class="lineStyle">
            </td>
        </tr>
        <tr>
            <td valign="top">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" id="innerContainer">
                    <tr>
                        <td width="200px" valign="top">
                            <br />
                            <br />
<?php include "../include/leftmenu.php"; ?>
 </td>
                        <td valign="middle" width="700px">
                           
                             <div style="margin:0 auto;text-align: center;">
                             
                    <?php
                                    session_destroy();
                                    header('location:'.baseurl().'guest/Login.php');
                    ?>      
                                 
                                 
                            </div>
                           
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
<?php include "../include/footer.php"; ?>