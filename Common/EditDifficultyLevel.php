<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>

<?php
$msg="";
$r=$_GET['did'];
$query="select * from tblDifficultyLevel where difficultyLevelId=$r";
$result=mysql_query($query,$con) or die (mysql_error($con));
$row = mysql_fetch_object($result);    

if(isset($_POST['smtUpdate']))
{
   
    
    
    
    $query="update tblDifficultyLevel set difficultyLevelTitle='$_POST[txtDifficulty_Level]',difficultyLevelDesc='$_POST[txtdesc]',difficultyLevelStatus='$_POST[kk]' where difficultyLevelId='$r'";
    
    $result=mysql_query($query,$con) or die(mysql_error($con));
    $b=mysql_affected_rows();
    if($b>0)
    {
        $msg="Record updated.";
        header('location:ManageDifficultyLevel.php');
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
                             
                    <form id="frmEdit_Difficulty_Level" method="post">
            
            <table align="center">
                
                <tr>
                    <td>
                        <fieldset>
                            <legend>Edit Difficulty Level</legend>
                            <table>
                                
                                <tr>
                                    <td><label id="lblDifficulty_Level">Difficulty Level</label></td>
                                    <td colspan="3"><input type="text" id="txtDifficulty_Level" name="txtDifficulty_Level" value="<?php echo $row->difficultyLevelTitle; ?>" ></td>
                                </tr>
                                
                                
                                <tr>
                                    <td><label id="lblDescription">Description</label></td>
                                    <td colspan="3"><textarea rows="3" cols="20" name="txtdesc"><?php echo $row->difficultyLevelDesc; ?></textarea></td>
                                </tr>
                                
                                
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" id="rbtnActive" name="kk" checked="true" value="Active"
                                               
                                               <?php
                                    echo isset($row->difficultyLevelStatus)?($row->difficultyLevelStatus=="Active"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               
                                               ><label id="Active">Active</label></td>
                                    <td><input type="radio" id="rbtnInactive" name="kk" value="Inactive"
                                               
                                               <?php
                                    echo isset($row->difficultyLevelStatus)?($row->difficultyLevelStatus=="Inactive"?'checked="true"':''):'';
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
                                        <div id="divmsg" style="color:red">
                                            <?php  echo $msg; ?>
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