<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>
<?php
$r=$_GET['mid'];
$query="select usrId,usrPwd,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile from tbluser where usrId='$r'";
$result=  mysql_query($query) or die(mysql_error($con));
$row = mysql_fetch_object($result); 
    
  
if(isset($_POST['smtUpdate']))
{
    $query="update tbluser set 
                    usrPwd='$_POST[txtPassword]',
                    usrStatus='$_POST[Status]',
                    usrName='$_POST[txtName]',
                    usrDOB='$_POST[txtDOB]',
                    usrGender='$_POST[Gender]',
                    usrEmail='$_POST[txtEmail]',
                    usrAddress='$_POST[txtAddress]',
                    usrMobile='$_POST[txtMobile]' 
                                                where usrId='$r'
";
$result=  mysql_query($query) or die(mysql_error($con));
header('location:'.  baseurl().'admin/ManageUser.php');    
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
                              <form id="frmEdit_User" method="post">
            <table align="center">
                <tr>
                    <td colspan="3">
                        <fieldset>
                            <legend>
                                Account Information
                            </legend>
                            <table>
                                <tr>
                                    <td><label id="lblUserId">User Id</label><span id="spnUserId" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtUserId" name="txtUserId" value="<?php  echo $row->usrId;  ?>" ></td>
                                </tr>
                                <tr>
                                    <td><label id="lblPassword">Password</label><span id="spnPassword" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtPassword" name="txtPassword"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblConfirm_Password">Confirm Password</label><span id="spnConfirm_Password" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtConfirm_Password" name="txtConfirm_Password"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblUser_Status">User Status</label></td>
                                    <td><input type="radio" id="rbtnActive" name="Status" value="Active" <?php
                                    echo isset($row->usrStatus)?($row->usrStatus=="Active"?'checked="true"':''):'checked="true"';
                                    ?>></td>
                                    <td><label id="Active">Active</label></td>
                                    <td><input type="radio" id="rbtnInactive" name="Status" value="Inactive"
                                               <?php
                                    echo isset($row->usrStatus)?($row->usrStatus=="Inactive"?'checked="true"':''):'';
                                    ?>></td>
                                    <td><label id="Inactive">Inactive</label></td>
                                </tr>
                            </table>
                        </fieldset>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <fieldset>
                            <legend>Personal Information</legend>
                            <table>
                                <tr>
                                    <td><label id="lblName">Name</label><span id="spnName" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtName" name="txtName" value="<?php  echo $row->usrName;  ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblDate_Of_Birth">Date of Birth</label><span id="spnDate_Of_Birth" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtDOB" name="txtDOB" value="<?php  echo $row->usrDOB;  ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblGender">Gender</label></td>
                                    <td><input type="radio" id="rbtnMale" name="Gender" value="Male"
                                               <?php
                                    echo isset($row->usrGender)?($row->usrGender=="Male"?'checked="true"':''):'checked="true"';
                                    ?>></td>
                                    <td><label id="Male">Male</label></td>
                                    <td><input type="radio" id="rbtnFemale" name="Gender" value="Female"
                                               <?php
                                    echo isset($row->usrGender)?($row->usrGender=="Female"?'checked="true"':''):'';
                                    ?>></td>
                                    <td><label id="Female">Female</label></td>
                                </tr>
                                <tr>
                                    <td><label id="lblEmail">Email</label><span id="spnEmail" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtEmail" name="txtEmail" value="<?php  echo $row->usrEmail;  ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblAddress">Address</label></td>
                                    <td colspan="4"><input type="text" id="txtAddress" name="txtAddress" value="<?php  echo $row->usrAddress;  ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblMobile">Mobile</label><span id="spnMobile" style="color:red">*</span></td>
                                    <td colspan="4"><input type="text" id="txtMobile" name="txtMobile" value="<?php  echo $row->usrMobile;  ?>"></td>
                                </tr>
                            </table>
                        </fieldset>
                    </td>
                </tr>
                <tr>
                    <td><input type="submit" id="smtUpdate" name="smtUpdate" value="Update"></td>
                    <td><input type="reset" id="smReset" name="smtReset" value="Reset"></td>
                    <td><input type="button" id="btnCancel" name="smtCancel" value="Cancel"></td>
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