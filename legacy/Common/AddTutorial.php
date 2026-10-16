<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>
<?php
$query1="select now()";
    $result1=mysql_query($query1,$con) or die(mysql_error($con));
    $date=mysql_result($result1,0,0);
if(isset($_POST['smtSave']))
{
$query="insert into tbltutorial (tutorialTitle,tutorialDesc,categoryId,difficultyLevelId,tutorialPrerequisites,tutorialCreateDate,tutorialStatus,usrId) values
    
                    ( '$_POST[txtTutorial_Title]',               
                     '$_POST[txtDesc]',               
                     $_POST[select_Category],               
                     $_POST[select_Level],               
                     '$_POST[txtPrerequities]',
                     '$date',
                     '$_POST[Status]',
                     '$_SESSION[userid]')";


$result=mysql_query($query,$con) or die(mysql_error($con));
$r=mysql_affected_rows();
if($r>0)
{
    $msg="record successfully added";
    
}
 else 
 {
   $msg="error in updation";  
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
                    
                                 
                                 <form id="frmAdd_Tutorial" method="post">
            <table align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>Add Tutorial</legend>
                            <table>
                                <tr>
                                    <td><label id="lblCategory">Category</label></td>
                                    <td><select name="select_Category">
                                            <option>-Select Category-</option>
                                            
                                            <?php
                                            $query="select categoryId,categoryTitle from tblcategory";
                                            $result=  mysql_query($query,$con) or die(mysql_error($con));
                                            while($row=mysql_fetch_object($result))
                                            {
                                            echo '<option value="'.$row->categoryId.'">'.$row->categoryTitle.'</option>';
                                            }
                                           
                                            ?>
                                            
                                        </select></td>
                                </tr>
                                <tr>
                                     <td><label id="lblLevel">Level</label></td>
                                        <td><select name="select_Level">
                                                <option>-Select level-</option>
                                            <?php
                                            $query="select difficultyLevelId,difficultyLevelTitle from tbldifficultylevel;";
                                            $result=  mysql_query($query,$con) or die(mysql_error($con));
                                            while($row=mysql_fetch_object($result))
                                            {
                                            echo '<option value="'.$row->difficultyLevelId.'">'.$row->difficultyLevelTitle.'</option>';
                                            }
                                           
                                            ?>             
                                             
                                        </select></td>
                                </tr>
                                <tr>
                                        <td><label id="lblTutorial_Title">Tutorial Title</label></td>
                                        <td><input type="text" id="txtTutorial_Title" name="txtTutorial_Title"></td>
                                </tr>
                                <tr>
                                        <td><label id="lblPrerequities">Prerequisites</label></td>
                                        <td><textarea name="txtPrerequities" rows="3" cols="20"></textarea></td>
                                </tr>
                                <tr>
                                        <td><label id="lblDescription">Descprition</label></td>
                                        <td><textarea name="txtDesc" rows="9" cols="40"></textarea></td>
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td><input type="button" id="btnSource" name="btnSource" value="Source">
                                    <input type="button" id="btnDesign" name="btnDesign" value="Design"></td>
                                    
                                   
                                </tr>
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" name="Status" id="rbtnActive" checked="true" value="Active"><label id="lblActive">Active</label>
                                        <input type="radio" name="Status" id="rbtnInactive" value="Inactive"><label id="lblInactive">Inactive</label>
                                    </td>
                                    
                                   
                                    
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td><input type="submit" id="smtSave" name="smtSave" value="Save">
                                    <input type="submit" id="smtSave_Add" name="smtSave_Add" value="Save & Add New">
                                    <input type="reset" id="btnReset" name="reset" value="Reset">
                                    <input type="button" id="Cancel" name="Cancel" value="Cancel"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div name="divmsg" style="color:red">
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
