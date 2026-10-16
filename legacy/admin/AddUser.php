<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>


<?php
$msg="";
/*if(isset($_POST['smtSave_Add']))
{
$query="insert into tbluser (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
                      values('$_POST[txtUserId]',
                             '$_POST[txtPassword]',
                             'Operator',
                             '$_POST[Status]',
                             '$_POST[txtName]',
                             '$_POST[txtDOB]',
                             '$_POST[Gender]',
                             '$_POST[txtEmail]',
                             '$_POST[txtAddress]',
                             '$_POST[txtMobile]')";
$result=mysql_query($query,$con) or die(mysql_error($con));
$rr=mysql_affected_rows();
if($rr>0)
{
    $msg="User Added Successfully.<br>Thank You!!";
}
}*/


if(isset($_POST['smtSave']))
{
 $query="select count(*) from tbluser where usrId='$_POST[txtUserId]'";
 $result=mysql_query($query,$con) or die(mysql_error($con));
 $counter=mysql_result($result,0,0);
 if($counter==0)
 {
     $flag=0;
                        $query="insert into tbluser (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
                        values('$_POST[txtUserId]',
                             '$_POST[txtPassword]',
                             'Operator',
                             '$_POST[Status]',
                             '$_POST[txtName]',
                             '$_POST[txtDOB]',
                             '$_POST[Gender]',
                             '$_POST[txtEmail]',
                             '$_POST[txtAddress]',
                             '$_POST[txtMobile]')";
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="User Added Successfully.<br>Thank You!!";
                    }
 }
 else 
{
    $msg="User Already Exists.<br>";
    $flag=1;
    
    
}
if($flag==0){
header('location:'.baseurl().'admin/ManageUser.php');
}

}


if(isset($_POST['smtSave_Add']))
{
 $query="select count(*) from tbluser where usrId='$_POST[txtUserId]'";
 $result=mysql_query($query,$con) or die(mysql_error($con));
 $counter=mysql_result($result,0,0);
 if($counter==0)
 {
     $flag=0;
                        $query="insert into tbluser (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
                        values('$_POST[txtUserId]',
                             '$_POST[txtPassword]',
                             'Operator',
                             '$_POST[Status]',
                             '$_POST[txtName]',
                             '$_POST[txtDOB]',
                             '$_POST[Gender]',
                             '$_POST[txtEmail]',
                             '$_POST[txtAddress]',
                             '$_POST[txtMobile]')";
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="User Added Successfully.<br>Thank You!!";
                    }
                    
 }
 else 
{
    $msg="User Already Exists.<br>";
    $flag=1;
    
    
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
                             
                                 
                    <form id="frmAdd_User" method="post" onsubmit="return check();">
            <table align="center">
                <tr>
                    <td colspan="4">
                        <fieldset>
                            <legend>
                                Account Information
                            </legend>
                            <table>
                                <tr>
                                    <td><label id="lblUserId">User Id</label><span id="spnUserId" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtUserId" name="txtUserId" value="<?php echo isset($_POST['txtUserId'])?$_POST['txtUserId']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblPassword">Password</label><span id="spnPwd" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtPassword" name="txtPassword" value="<?php echo isset($_POST['txtPassword'])?$_POST['txtPassword']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblConfirm_Password">Confirm Password</label><span id="spnConfirm_Pwd" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtConfirm_Password" name="txtConfirm_Password" value="<?php echo isset($_POST['txtConfirm_Password'])?$_POST['txtconfirm_Password']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblUser_Status">User Status</label></td>
                                    <td><input type="radio" checked="true" id="rbtnActive" name="Status" value="Active"
                                               
                                               <?php
                                    echo isset($_POST['Status'])?($_POST['Status']=="Active"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               ></td>
                                    <td><label id="Active">Active</label></td>
                                    <td><input type="radio" id="rbtnInactive" name="Status" value="Inactive"
                                               
                                               <?php
                                    echo isset($_POST['Status'])?($_POST['Status']=="Inactive"?'checked="true"':''):'';
                                    ?>
                                               
                                               ></td>
                                    <td><label id="Inactive">Inactive</label></td>
                                </tr>
                            </table>
                        </fieldset>
                    </td>
                </tr>
                <tr>
                    <td colspan="4">
                        <fieldset>
                            <legend>Personal Information</legend>
                            <table>
                                <tr>
                                    <td><label id="lblName">Name</label><span id="spnName" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtName" name="txtName" value="<?php echo isset($_POST['txtName'])?$_POST['txtName']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblDate_Of_Birth">Date of Birth</label><span id="spnDOB" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtDOB" name="txtDOB" value="<?php echo isset($_POST['txtDOB'])?$_POST['txtDOB']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblGender">Gender</label></td>
                                    <td><input type="radio" checked="true" id="rbtnMale" name="Gender" value="Male"
                                               
                                                <?php
                                    echo isset($_POST['Gender'])?($_POST['Gender']=="Male"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               ></td>
                                    <td><label id="Male">Male</label></td>
                                    <td><input type="radio" id="rbtnFemale" name="Gender" value="Female"
                                               
                                                <?php
                                    echo isset($_POST['Gender'])?($_POST['Gender']=="Female"?'checked="true"':''):'';
                                    ?>
                                               
                                               ></td>
                                    <td><label id="Female">Female</label></td>
                                </tr>
                                <tr>
                                    <td><label id="lblEmail">Email</label><span id="spnEmail" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtEmail" name="txtEmail" value="<?php echo isset($_POST['txtEmail'])?$_POST['txtEmail']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblAddress">Address</label><span id="spnAddress" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtAddress" name="txtAddress" value="<?php echo isset($_POST['txtAddress'])?$_POST['txtAddress']:"" ; ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblMobile">Mobile</label><span id="spnMobile" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtMobile" name="txtMobile" value="<?php echo isset($_POST['txtMobile'])?$_POST['txtMobile']:"" ; ?>"></td>
                                </tr>
                            </table>
                        </fieldset>
                    </td>
                </tr>
                <tr>
                    <td><input type="submit" id="smtSave" name="smtSave" value="Save"></td>
                    <td><input type="submit" id="smtSave_Add" name="smtSave_Add" value="Save & Add New"></td>
                    <td><input type="reset" id="smtReset" name="smtReset" value="Reset"></td>
                    <td><input type="button" id="btnCancel" name="smtCancel" value="Cancel"></td>
                </tr>
                <tr>
                    <td>
                <div id="divmsg" style="color:red">
                    <?php echo $msg;?>
                </div>
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

  <?php include_once "../include/footer.php"; ?>
