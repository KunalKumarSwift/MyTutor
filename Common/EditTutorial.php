<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>

<?php
$r=$_GET['tid'];
$query="select  * from tblcategory a,tbldifficultylevel b,tbltutorial c where a.categoryId=c.categoryId and b.difficultyLevelId=c.difficultyLevelId and tutorialId='$r'";
$result=mysql_query($query,$con) or die(mysql_error($con));
$row=  mysql_fetch_object($result);

?>
<?php

if(isset($_POST['smtUpdate']))
{
    
    $query="update tbltutorial set
                    categoryId='$_POST[select1]',
                    difficultyLevelId='$_POST[select2]',
                    tutorialTitle='$_POST[txtTutorial_Title]',
                    tutorialPrerequisites='$_POST[txtPrerequities]',
                    tutorialDesc='$_POST[txtDesc]',
                    tutorialStatus='$_POST[Status]' where
                                                            tutorialId=$r";
    $result=mysql_query($query,$con) or die(mysql_error($con));
    $r=mysql_affected_rows();
    if($r>0)
    {
        $msg="Record Updated Successfully.";
    }
    else
    {
        $msg="Error In Updation.";
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
                    
                                 
                                 <form id="frmEdit_Tutorial" method="post">
            <table align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>Edit Tutorial</legend>
                            <table>
                                <tr>
                                    <td><label id="lblCategory">Category</label></td>
                                    <td><select name="select1">
                                                                                 
                                                    <?php
                                                    echo '<option value="'.$row->categoryId.'">'.$row->categoryTitle.'</option>';
                                                    ?>
                                            
                                            <?php
                                            $query1 = "select categoryId,categoryTitle from tblcategory where categoryStatus='Active'";
                                            $result1 = mysql_query($query1, $con) or die(mysql_error($con));
                                            while ($row1 = mysql_fetch_object($result1)) 
                                                {
                                                echo '<option value="' . $row1->categoryId . '">' . $row1->categoryTitle . '</option>';
                                                }
                                            ?>
                                                       </select></td>
                                </tr>
                                <tr>
                                     <td><label id="lblLevel">Level</label></td>
                                        <td><select name="select2">
                                            
                                                 <?php
                                                    echo '<option value="'.$row->difficultyLevelId.'">'.$row->difficultyLevelTitle.'</option>';
                                                    ?>
                                                
                                                <?php
                                                    $query1 = "select difficultyLevelId,difficultyLevelTitle from tbldifficultylevel where difficultyLevelStatus='Active'";
                                                    $result1 = mysql_query($query1, $con) or die(mysql_error($con));
                                                    while ($row1 = mysql_fetch_object($result1)) {
                                                        echo '<option value="' . $row1->difficultyLevelId . '">' . $row1->difficultyLevelTitle . '</option>';
                                                    }
                                                
                                                ?>
                                                
                                                
                                        </select></td>
                                </tr>
                                <tr>
                                        <td><label id="lblTutorial_Title">Tutorial Title</label></td>
                                        <td><input type="text" id="txtTutorial_Title" name="txtTutorial_Title" value="<?php echo $row->tutorialTitle; ?>"></td>
                                </tr>
                                <tr>
                                        <td><label id="lblPrerequities">Prerequisites</label></td>
                                        <td><textarea id="txtPrerequities" rows="3" cols="20" name="txtPrerequities"><?php echo $row->tutorialPrerequisites; ?></textarea></td>
                                </tr>
                                <tr>
                                        <td><label id="lblDescription">Descprition</label></td>
                                        <td><textarea id="txtDesc" name="txtDesc" rows="9" cols="40"><?php echo $row->tutorialDesc; ?></textarea></td>
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td><input type="button" id="btnSource" name="btnSource" value="Source">
                                    <input type="button" id="btnDesign" name="btnDesign" value="Design"></td>
                                    
                                   
                                </tr>
                                <tr>
                                    <td><label id="lblStatus">Status</label></td>
                                    <td><input type="radio" name="Status" id="rbtnActive" checked="true" value="Active"
                                               
                                               <?php
                                    echo isset($row->tutorialStatus)?($row->tutorialStatus=="Active"?'checked="true"':''):'checked="true"';
                                    ?>
                                               
                                               ><label id="lblActive">Active</label>
                                        <input type="radio" name="Status" id="rbtnInactive" value="Inactive"
                                               
                                               <?php
                                    echo isset($row->tutorialStatus)?($row->tutorialStatus=="Inactive"?'checked="true"':''):'';
                                    ?>
                                               
                                               ><label id="lblInactive">Inactive</label>
                                    </td>
                                    
                                   
                                    
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td><input type="submit" id="smtUpdate" name="smtUpdate" value="Update">
                                    <input type="reset" id="btnReset" name="reset" value="Reset">
                                    <input type="button" id="Cancel" name="Cancel" value="Cancel"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div id="divmsg" style="color:red">
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
