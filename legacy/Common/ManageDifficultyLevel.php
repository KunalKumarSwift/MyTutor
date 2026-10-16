<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>




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
                             
                    
                                 <form id="frmManage_Difficulty_Level" method="post">
        <table align="center" >
            
            <tr>
                <td>
                    <fieldset>
                        <legend>Manage Difficulty Level</legend>
                        <table >
                            <tr >
                                <td ><input type="submit" id="smtAddNew" name="smtAddNew" value="Add New"></td>
                                <td><label id="lblDifficulty_Level">Difficulty Level</label></td>
                                <td><input type="text" id="txtDifficulty" name="txtDifficulty"></td>
                                <td><input type="submit" id="smtSearch" name="smtSearch" value="Search"></td>
                            </tr>
                        </table>
                        <table border="1" align="center" class="tblStyle">
                            <tr>
                                <td>Difficulty Level</td>
                                <td>Description</td>
                                <td>Status</td>
                                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            </tr>
                            
                            <?php

                            $query="select difficultyLevelId,difficultyLevelTitle,difficultyLevelDesc,difficultyLevelStatus from tbldifficultyLevel where difficultyLevelTitle like'%".$_POST['txtDifficulty']."%'";
                            $result=mysql_query($query,$con) or die(mysql_error($con));
                            while($row=  mysql_fetch_object($result))
                                {
                                    echo '<tr><td>'.$row->difficultyLevelTitle.'</td>';
                                    echo '<td>'.$row->difficultyLevelDesc.'</td>';
                                    echo '<td>'.$row->difficultyLevelStatus.'</td>';
                                    echo'<td><a href=EditDifficultyLevel.php?did='.$row->difficultyLevelId.'>EDIT</a></td></tr>';


                                }


?>
                            
                        </table>
                        
                        <table align="right">
                            <tr>
                                <td colspan="3" align="right"><input type="button" id="btnPrevious" name="btnPrevious" value="<<"></td>
                                <td align="left"><input type="button" id="btnNext" name="btnNext" value=">>"></td>
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
