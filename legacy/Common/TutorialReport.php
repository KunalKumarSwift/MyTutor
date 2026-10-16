<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php// include "checksession.php";?>

<?php
$query="select * from tblUser a,tbltutorial b,tblcategory c,tbldifficultyLevel d where
                               a.usrId=b.usrId and c.categoryId=b.categoryId and d.difficultyLevelId=b.difficultyLevelId";
$result = mysql_query($query,$con) or die(mysql_error($con));


if(isset($_POST['smtProceed']))
{
$query="select * from tblUser a,tbltutorial b,tblcategory c,tbldifficultyLevel d where
                               a.usrId=b.usrId and c.categoryId=b.categoryId and d.difficultyLevelId=b.difficultyLevelId
                                and b.tutorialCreateDate between '$_POST[txtdate1]' and '$_POST[txtdate2]'";
$result=mysql_query($query,$con) or die(mysql_error($con));

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
       
                                 
                                 <html>
    <head>
        <title>Tutorial Report</title>
    </head>
    <body>
        <form id="frmTutorial_Report" method="post">
            <table align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>Tutorial Report</legend>
                            <table>
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Date Range</legend>
                                            <table>
                                            <tr>
                                                
                                                <td><label id="lblfrom">From</label></td>
                                                <td><input type="text" id="txtdate1" name="txtdate1"></td>
                                                <td><label id="lblto">To</label></td>
                                                <td><input type="text" id="txtdate2" name="txtdate2"></td>
                                                <td><input type="submit" id="btnProceed" name="smtProceed" value="Proceed"> </td>
                                                <td><input type="reset" id="btnreset" name="btnreset" value="Reset"></td>
                                                
                                            </tr>
                                            </table>
                                        </fieldset>
                                        <table align="center" border="1">
                                            <tr>
                                                <td>UserId</td>
                                                <td>Name</td>
                                                <td>Category</td>
                                                <td>Tutorial Title</td>
                                                <td>Difficulty Level</td>
                                                <td>Date</td>
                                            </tr>
                                            <?php
                                            while($row=mysql_fetch_object($result))
                                            {
                                                echo '<tr><td>'.$row->usrId.'</td>';
                                                echo '<td>'.$row->usrName.'</td>';
                                                echo '<td>'.$row->categoryTitle.'</td>';
                                                echo '<td>'.$row->tutorialTitle.'</td>';
                                                echo '<td>'.$row->difficultyLevelTitle.'</td>';
                                                echo '<td>'.$row->tutorialCreateDate.'</td></tr>';
                                                
                                            }
                                            
                                            
                                            ?>
                                        </table>
                                    </td>
                                </tr>
                                
                            </table>
                        </fieldset>
                    </td>
                </tr>
            </table>
        
        </form>
    </body>
</html>


       
                
                            </div>
                           
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
<?php include "../include/footer.php"; ?>