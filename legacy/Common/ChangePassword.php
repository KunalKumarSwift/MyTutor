<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>
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
                             
                      <form id="frmChange_Password" method="post" onsubmit="return check();" >
            <table align="center">
                <tr>
                    
                         <td style="color:red"><?php  echo $msg; ?> </td>
                    
                </tr>
                <tr>
                   
                    <td>
                        <fieldset>
                            <legend>Change Password</legend>
                            <table>
                                <tr>
                                    <td><label id="lblUserId">User Id</label></td>
                                    <td><label id="lblId"><?php echo $_SESSION['username']; ?></label></td>
                                </tr>
                                <tr>
                                     <td><label id="lblCurrent_Password">Current Password</label><span id="spnCurrent_Password" style="color:red">*</span></td>
                                    <td><input type="text" id="txtCurrent_Password" name="txtCurrent_Password"></td>
                                </tr>
                                <tr>
                                     <td><label id="lblNew_Password">New Password</label><span id="spnNew_Password" style="color:red">*</span></td>
                                    <td><input type="text" id="txtNew_Password" name="txtNew_Password"></td>
                                </tr>
                                <tr>
                                     <td><label id="lblConfirm_Password">Confirm Password</label><span id="spnConfirm_Password" style="color:red">*</span></td>
                                    <td><input type="text" id="txtConfirm_Password" name="txtConfirm_Password"></td>
                                </tr>
                                <tr>
                                    <td align="right"><input type="submit" id="smtUpdate" name="smtUpdate" value="Update"></td>
                                    <td align="left"> <input type="button" id="smtCancel" name="smtCancel" value="Cancel"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div id="divmsg" style="color:red">
                                            
                                        </div>
                                    </td>
                                </tr>
                                
                            </table>
                        </fieldset>
                    </td>
                </tr>
            </table>  
            
        </form>

                
                            </div>
                           
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
<?php include "../include/footer.php"; ?>
