<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>
<?php
$msg="";
$r=$_GET['cid'];
$query="select * from tblcategory where categoryId=$r";
$result=mysql_query($query,$con) or die (mysql_error($con));
$row = mysql_fetch_object($result);    

if(isset($_POST['smtUpdate']))
{
   
    
    
    
    $query="update tblcategory set categoryTitle='$_POST[txtCategory]',categoryDesc='$_POST[txtDescription]',categoryStatus='$_POST[kk]' where categoryId='$r'";
    
    $result=mysql_query($query,$con) or die(mysql_error($con));
    $b=mysql_affected_rows();
    if($b>0)
    {
        $msg="Record updated.";
        header('location:ManageCategory.php');
    }
    else{
        $msg="Error in updation.";
    }
    //header('location:ManageCategory.php');
    
    
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
                    
                                 
                                 <form id="frmEdit_Category" method="post">
        
            <table align="center">
                
                <tr>
                    <td>
                        <fieldset>
                            <legend>Edit Category</legend>
                            <table>
                                
                                <tr>
                                    <td><label id="lblCategory">Category</label></td>
                                    <td colspan="3"><input type="text" id="txtCategory" name="txtCategory" value="<?php echo $row->categoryTitle; ?>"></td>
                                </tr>
                                
                                
                                <tr>
                                    <td><label id="lblDescription">Description</label></td>
                                    <td colspan="3"><textarea name="txtDescription" rows="3" cols="20" ><?php echo $row->categoryDesc; ?></textarea></td>
                                </tr>
                                
                                
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" id="rbtnActive" name="kk" checked="true" value="Active"
                                               
                                               
                                                <?php
                                    echo isset($row->categoryStatus)?($row->categoryStatus=="Active"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               ><label id="Active">Active</label></td>
                                    <td><input type="radio" id="rbtnInactive" name="kk" value="Inactive"
                                               <?php
                                    echo isset($row->categoryStatus)?($row->categoryStatus=="Inactive"?'checked="true"':''):'';
                                    ?>
                                               
                                               ><label id="Inactive">Inactive</label></td>
                                </tr>
                               
                               
                               <tr>
                                    <td><input type="submit" id="smtUpdate" name="smtUpdate" value="Update"></td>
                                    
                                    <td><input type="reset" id="smtReset" name="smtReset" value="Reset"></td>
                                    
                                    <td><input type="button" id="smtCancel" name="smtCanncel" value="Cancel"></td>
                                </tr>
                                <tr>
                                    <td>
                                <div id="divmsg" style="color:maroon;font-size:20px ">
                                    <?php
                                    echo $msg;
                                    ?>
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