<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>

<?php
if(isset($_POST['smtSave']))
{
     $query="select count(*) from tblcategory where categoryTitle='$_POST[txtCategory]'";
    $result=  mysql_query($query,$con) or die(mysql_error($con));
    $counter=mysql_result($result,0,0);
    if($counter==0)
    
    {
    

                        $query="insert into tblcategory (categoryTitle,categoryDesc,categoryStatus)
                        values ('$_POST[txtCategory]',
                             '$_POST[txtDescprition]',
                             '$_POST[kk]')";
                             
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="Category Added Successfully.<br>Thank You!!";
                    
                    
                        header('location:ManageCategory.php');
                    
                    }
    }
 
 else 
{
    $msg="Category already Exists.<br>";
    
    
    
}
}


if(isset($_POST['smtSave_Add']))
{
     $query="select count(*) from tblcategory where categoryTitle='$_POST[txtCategory]'";
    $result=  mysql_query($query,$con) or die(mysql_error($con));
    $counter=mysql_result($result,0,0);
    if($counter==0)
    
    {
    

                        $query="insert into tblcategory (categoryTitle,categoryDesc,categoryStatus)
                        values ('$_POST[txtCategory]',
                             '$_POST[txtDescprition]',
                             '$_POST[kk]')";
                             
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="Category Added Successfully.<br>Thank You!!";
                    }
    }
 
 else 
{
    $msg="Category already Exists.<br>";
    
    
    
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
                    
                                 
           <form id="frmAdd_category" method="post">
            <table align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>Add Category</legend>
                            <table>
                                <tr>
                                    <td><label id="lblCategory">Category</label></td>
                                    <td colspan="3"><input type="text" id="txtCategory" name="txtCategory" value="<?php 
                                                                    
                                                            echo isset($_POST['txtCategory'])?$_POST['txtCategory']:"";
                                    
                                    ?>"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblDescription">Description</label></td>
                                    <td colspan="3"><textarea rows="3" cols="20" name="txtDescprition"><?php 
                                                                    
                                                            echo isset($_POST['txtCategory'])?$_POST['txtCategory']:"";
                                    
                                    ?></textarea></td>
                                </tr>
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" id="rbtnActive" name="kk" checked="true" value="Active"
                                               <?php
                                    echo isset($_POST['kk'])?($_POST['kk']=="Active"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               ><label id="Active">Active</label></td>
                                 
                                    <td><input type="radio" id="rbtnInactive" name="kk" value="Inactive"
                                               
                                               
                                               <?php
                                    echo isset($_POST['kk'])?($_POST['kk']=="Inactive"?'checked="true"':''):'';
                                    ?>
                                               
                                               
                                               ><label id="Inactive">Inactive</label></td>
                                 
                                </tr>
                                <tr>
                                    <td><input type="submit" id="smtSave" name="smtSave" value="Save"></td>
                                    <td><input type="submit" id="smtSave_Add" name="smtSave_Add" value="Save & Add New"></td>
                                    <td><input type="reset" id="smtReset" name="smtReset" value="Reset"></td>
                                    <td><input type="button" id="smtCancel" name="smtCanncel" value="Cancel"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div id="divmsg" style="color:red">
                                        <?php echo $msg; ?>    
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