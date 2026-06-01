<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php"; ?>
<?php ?>






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


                        <form id="frmManage_Tutorial" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Manage Tutorials</legend>
                                            <table>
                                                <tr>
                                                    <td><input type="button" id="smtAdd_New" name="smtAdd_New" value="Add new" onclick="window.location.href='AddTutorial.php'"></td>
                                                </tr>
                                                <tr>
                                                    <td><label id="lblCategory">Category</label></td>
                                                    <td><select id="select_Category" name="select_Category">
                                                            <option value="">-All Category-</option>


<?php
$query = "select categoryId,categoryTitle from tblcategory where categoryStatus='Active'";
$result = mysql_query($query, $con) or die(mysql_error($con));
while ($row = mysql_fetch_object($result)) {
    echo '<option value="' . $row->categoryId . '">' . $row->categoryTitle . '</option>';
}
?>





                                                        </select></td>
                                                    <td><select id="select_Level" name="select_Level">
                                                            <option value="">-All Level-</option>
<?php
$query = "select difficultyLevelId,difficultyLevelTitle from tbldifficultylevel where difficultyLevelStatus='Active'";
$result = mysql_query($query, $con) or die(mysql_error($con));
while ($row = mysql_fetch_object($result)) {
    echo '<option value="' . $row->difficultyLevelId . '">' . $row->difficultyLevelTitle . '</option>';
}
?>


                                                        </select></td>
                                                </tr>
                                                <tr>
                                                    <td><label id="lblTutorial_Title">Tutorial Title</label></td>
                                                    <td><input type="text" id="txtTutorial_Title" name="txtTutorial_Title"></td>
                                                    <td><input type="submit" id="smtSearch" name="smtSearch" value="Search"></td>
                                                    <td><input type="reset" id="smtReset" name="smtReset" value="Reset"></td>
                                                </tr>
                                            </table>
                                            <table>
                                                <tr>
                                                    <td>
                                                        <hr width="100%">
                                                    </td>
                                                </tr>
                                            </table>
                                            <table border="1">


                                                <tr>
                                                    <td>Tutorial Title</td>
                                                    <td>Category</td>
                                                    <td>Level</td>
                                                    <td>Prerequisites</td>
                                                    <td>Status</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <tr>
<?php
if (isset($_POST['smtSearch'])) {

if($_POST['select_Category']!="" && $_POST['select_Level']!="")
{
    $query="select * from tblTutorial where tutorialTitle like '%" . $_POST['txtTutorial_Title'] . "%' and categoryId=".$_POST['select_Category']." and difficultyLevelId=".$_POST['select_Level']."";
}
else if($_POST['select_Category']=="" && $_POST['select_Level']!="")
{
    $query = "select * from tblTutorial where tutorialTitle like '%" . $_POST['txtTutorial_Title'] . "%' and difficultyLevelId='$_POST[select_Level]'";
}
else if($_POST['select_Level']=="" && $_POST['select_Category']!="")
{
$query = "select * from tblTutorial where tutorialTitle like '%" . $_POST['txtTutorial_Title'] . "%' and categoryId='$_POST[select_Category]'";
    
}
else if($_POST['select_Category']=="" && $_POST['select_Level']=="")
{
    $query = "select * from tblTutorial where tutorialTitle like '%" . $_POST['txtTutorial_Title'] . "%'";
}



    


    $result = mysql_query($query, $con) or die(mysql_error($con));

    while ($row = mysql_fetch_object($result)) {
        echo '<tr><td>' . $row->tutorialTitle . '</td>';
        $query1 = "select categoryTitle from tblcategory where categoryId='$row->categoryId'";
        $result1 = mysql_query($query1, $con) or die(mysql_error($con));
        $row1 = mysql_fetch_object($result1);
        echo '<td>' . $row1->categoryTitle . '</td>';

        $query2 = "select difficultyLevelTitle from tbldifficultylevel where difficultyLevelId='$row->difficultyLevelId'";
        $result2 = mysql_query($query2, $con) or die(mysql_error($con));
        $row2 = mysql_fetch_object($result2);

        echo '<td>' . $row2->difficultyLevelTitle . '</td>';
        echo '<td>' . $row->tutorialPrerequisites . '</td>';
        echo '<td>' . $row->tutorialStatus . '</td>';
        echo'<td><a href=EditTutorial.php?tid=' . $row->tutorialId . '>EDIT</a></td></tr>';
    }
} else {

    $query = "select * from tblcategory a,tbldifficultylevel b,tblTutorial c where a.categoryId=c.categoryId and b.difficultyLevelId=c.difficultyLevelId";

    $result = mysql_query($query, $con) or die(mysql_error($con));

    while ($row = mysql_fetch_object($result)) {
        echo '<tr><td>' . $row->tutorialTitle . '</td>';
        echo '<td>' . $row->categoryTitle . '</td>';
        echo '<td>' . $row->difficultyLevelTitle . '</td>';
        echo '<td>' . $row->tutorialPrerequisites . '</td>';
        echo '<td>' . $row->tutorialStatus . '</td>';
        echo'<td><a href=EditTutorial.php?tid=' . $row->tutorialId . '>EDIT</a></td></tr>';
    }
}
?>
                                                </tr>

                                            </table>
                                            <table align="right">
                                                <tr>
                                                    <td>
                                                        <input type="button" id="btnPrevious" name="btnPrevious" value="<<">
                                                    </td>
                                                    <td>
                                                        <input type="button" id="btnNext" name="btnNext" value=">>">
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