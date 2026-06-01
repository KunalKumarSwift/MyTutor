<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>



    <?php
                        $msg1="";
                        $status="recover";
                        if(isset($_POST['smtRecover']))
                        {
                        $query="select usrPwd from tbluser where usrId='$_POST[txtUserId]' and usrEmail='$_POST[txtEmail]'";
                        $result=  mysql_query($query,$con) or die(mysql_error($con));

                        if(mysql_num_rows($result)>0)
                        {
                          $password=mysql_result($result,0,'usrPwd');
                          $status="success";
                        }
                         else {
                            $msg1="Invalid UserName or Password";
                        }
                        }
?>



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
                             
                    <form id="frmForgot_Password" method="post" onsubmit="return check();">
            <table align="center">
                <tr>
                    <td>
                        <?php  
                            
                          if(  $status=="recover")
                          {

                        
                        ?>
                        <fieldset>
                            <legend>
                                Forgot Password
                            </legend>
                            <table>
                                <tr>
                                    <td style="color:red"><?php echo $msg1; ?></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><label id="lblMsg">Enter your username & Email</label></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><label id="lblMsg_Confrm">Your new password will be sent to your Email id.</label></td>
                                </tr>
                                <tr>
                                <td><label id="lblUserId">User Id</label>
                                    <span id="spnUserId" style="color:red">*</span></td>
                                   <td> <input type="text" id="txtUserId" name="txtUserId"></td>
                                   <td>&nbsp;</td>
                                </tr>
                                <tr>
                                   <td>
                                    <label id="lbEmail">Email</label>
                                    <span id="spnEmail" style="color:red">*</span></td>
                                    <td><input type="text" id="txtEmail" name="txtEmail"></td>
                                    <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td align="right"><input type="submit" id="smtRecover" name="smtRecover" value="Recover"></td>
                                <td align="center"><input type="submit" id="smtReset" name="smtReset" value="Reset"></td>
                                <td align="left"><input type="button" id="btnCancel" name="smtCancel" value="Cancel"></td>
                            </tr>
                            <tr>
                                <td>
                                    <div id="divmsg" style="color: red">
                                        
                                    </div>
                                </td>
                            </tr>
                            </table>
                        </fieldset>
                       
                    
                    </td>
                </tr>
                        
                <tr>
                    <td><hr width="100%"></hr></td>
                </tr>
                <?php 
                            }
                            else if(  $status=="success" )
                            {
                        ?> 
                <tr>
                    <td>
                
                        <fieldset>
                            <legend>
                                Password Information
                            </legend>
                            <table>
                                <tr>
                                    <td>Your new Password is:<?php echo $password; ?> and it has been sent.</td>
                                </tr>
                                <tr>
                                    <td><a href="<?php echo baseurl(); ?>Login.php" style="color:royalblue">Click here</a>&nbsp;to proceed for login.</td>
                                    
                                </tr>
                            </table>
                        </fieldset>                      
                        <?php
                            }
                        ?>
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