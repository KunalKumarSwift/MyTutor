<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>
<?php
if(isset($_POST['smtSave']))
{
     $query="select count(*) from tbldifficultylevel where difficultyLevelTitle='$_POST[txtDifficulty_Level]'";
    $result=  mysql_query($query,$con) or die(mysql_error($con));
    $counter=mysql_result($result,0,0);
    if($counter==0)
    
    {
    

                        $query="insert into tbldifficultylevel (difficultyLevelTitle,difficultyLevelDesc,difficultyLevelStatus)
                        values ('$_POST[txtDifficulty_Level]',
                             '$_POST[txtDesc]',
                             '$_POST[kk]')";
                             
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="Difficulty Level Added Successfully.<br>Thank You!!";
                    
                    
                        header('location:ManageDifficultyLevel.php');
                    
                    }
    }
 
 else 
{
    $msg="Difficulty Level already Exists.<br>";
    
    
    
}
}


if(isset($_POST['smtSave_Add']))
{
     $query="select count(*) from tbldifficultylevel where difficultyLevelTitle='$_POST[txtDifficulty_Level]'";
    $result=  mysql_query($query,$con) or die(mysql_error($con));
    $counter=mysql_result($result,0,0);
    if($counter==0)
    
    {
    

                        $query="insert into tbldifficultylevel (difficultyLevelTitle,difficultyLevelDesc,difficultyLevelStatus)
                        values ('$_POST[txtDifficulty_Level]',
                             '$_POST[txtDesc]',
                             '$_POST[kk]')";
                             
                        $result=mysql_query($query,$con) or die(mysql_error($con));
                        $rr=mysql_affected_rows();
                        if($rr>0)
                    {
                    $msg="Difficulty Level Added Successfully.<br>Thank You!!";
                    
                    
                                           
                    }
    }
 
 else 
{
    $msg="Difficulty Level already Exists.<br>";
    
    
    
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
                             
                    
                                 <form id="frmAdd_Difficulty_Level" method="post">
            <table align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>Add Difficulty Level</legend>
                            <table>
                                <tr>
                                    <td><label id="lblDifficulty_Level">Difficulty Level</label></td>
                                    <td colspan="3"><input type="text" id="txtDifficulty_Level" name="txtDifficulty_Level"></td>
                                </tr>
                                <tr>
                                    <td><label id="lblDescription">Description</label></td>
                                    <td colspan="3"><textarea rows="3" cols="20" name="txtDesc"></textarea></td>
                                </tr>
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" id="rbtnActive" name="kk" checked="true" value="Active"><label id="Active">Active</label></td>
                                 
                                    <td><input type="radio" id="rbtnInactive" name="kk" value="Inactive"><label id="Inactive">Inactive</label></td>
                                 
                                </tr>
                                <tr align="center">
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