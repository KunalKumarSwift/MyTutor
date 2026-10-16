<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>

<?php
if(isset($_POST['smtUpdate']))
{
    
    if($_POST['txtName']!="" && $_POST['txtDOB']!="" &&
       $_POST['txtAddress']!="" && $_POST['txtMobile']!=""&&
       $_POST['txtEmail']!="")
        {
    
    
        $query="update tbluser set
                                    usrName='$_POST[txtName]',
                                    usrDOB='$_POST[txtDOB]',
                                    usrGender='$_POST[Gender]',
                                    usrAddress='$_POST[txtAddress]',
                                    usrMobile='$_POST[txtMobile]',
                                    usrEmail='$_POST[txtEmail]' where usrId='$_SESSION[userid]'";
        
        $result=mysql_query($query,$con) or die(mysql_error($con));
        //$row=mysql_affected_rows($result);
        //if($row>0)
       // {
            if($_SESSION['usertype']=="Admin")
            {
                header('location:'.baseurl().'admin/index.php');
            }
            else
            {
                header('location:'.baseurl().'operator/index.php');
            }
        }
        
}

?>


<?php


$query="select usrId,usrName,usrDOB,usrGender,usrAddress,usrMobile,usrEmail from tbluser where usrId='$_SESSION[userid]'";
$result=mysql_query($query,$con) or die(mysql_error($con));
$row=mysql_fetch_object($result);


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
                             
                    <form id="frmManage_Profile" method="post" onsubmit="return check();">
            <table align="center">
                <tr>
                    <td colspan="3">
                        <fieldset>
                            <legend>Account Information</legend>
                            <table>
                                <tr>
                                    <td><label id="lblUserId">User Id</label></td>
                                    <td><label id="lblFill_UserId"><?php echo $_SESSION['userid'];?></label></td>
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
                                    <td><label id="lblName">Name</label><span id="spnName" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtName" name="txtName" value="<?php  
                                                                                                            echo isset($row->usrName)?$row->usrName:"";    
                                                                                                            ;?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblDate_Of_Birth">Date of Birth</label><span id="spnDOB" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtDOB" name="txtDOB" value="<?php  
                                                                                                            echo isset($row->usrDOB)?$row->usrDOB:"";    
                                                                                                            ;?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblGender">Gender</label></td>
                                    <td><input type="radio" id="rbtnMale" name="Gender" value="Male"
                                    <?php
                                    echo isset($row->usrGender)?($row->usrGender=="Male"?'checked="true"':''):'checked="true"';
                                    ?>
                                     >          
                                    </td>
                                    <td><label id="Male">Male</label></td>
                                    <td><input type="radio" id="rbtnFemale" name="Gender" value="Female"
                                    
                                    <?php
                                    echo isset($row->usrGender)?($row->usrGender=="Female"?'checked="true"':''):'';
                                    ?>
                                    >
                                    </td>
                                    <td><label id="Female">Female</label></td>
                                </tr>
                                <tr>
                                    <td><label id="lblEmail">Email</label><span id="spnEmail" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtEmail" name="txtEmail"value="<?php  
                                                                                                            echo isset($row->usrEmail)?$row->usrEmail:"";    
                                                                                                            ;?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblAddress">Address</label><span id="spnAddress" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtAddress" name="txtAddress" value="<?php  
                                                                                                            echo isset($row->usrAddress)?$row->usrAddress:"";    
                                                                                                            ;?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblMobile">Mobile</label><span id="spnMobile" style="color:red"></span></td>
                                    <td colspan="4"><input type="text" id="txtMobile" name="txtMobile" value="<?php  
                                                                                                            echo isset($row->usrMobile)?$row->usrMobile:"";    
                                                                                                            ;?>"></td>
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
