<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php

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
        <title>
            View Tutorial
        </title>
    
    </head>
    <body>
        <form id="frmViewTutorial" method="post">
        <table align="center">
            <tr>
                <td>
                    <fieldset>
                        <legend>
                            View Tutorials
                        </legend>
                        <table>
                            <tr>
                                <td><label id="lblcategory">Category</label> 
                                    <select id="ddlcategory" name="ddlcategory">
                                        <option value="">-Select-</option>
                                        <?php
                                        $query="select * from tblCategory";
                                        $result=  mysql_query($query,$con) or die(mysql_error($con));
                                        while($row=  mysql_fetch_object($result))
                                        {
                                            echo'<option value="'.$row->categoryId.'">'.$row->categoryTitle.'</option>';
                                        }    
                                                                                
                                        ?>
                                    </select>
                                
                                </td>
                                
                            </tr>
                            <tr>
                                <td><label id="lbllevel">Level&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label> 
                                    <select id="ddllevel" name="ddllevel">
                                        <option value="">-Select-</option>
                                        <?php
                                        $query="select * from tbldifficultylevel";
                                        $result=  mysql_query($query,$con) or die(mysql_error($con));
                                        while($row=  mysql_fetch_object($result))
                                        {
                                            echo'<option value="'.$row->difficultyLevelId.'">'.$row->difficultyLevelTitle.'</option>';
                                        }    
                                                                                
                                        ?>
                                    </select>
                                
                                </td>
                                
                            </tr>
                            <tr align="center">
                                <td><input type="submit" id="smtProceed" name="smtProceed" value="Proceed">
                                <input type="reset" id="smtReset" name="smtReset" value="Reset"></td>
                            </tr>
                        </table>
                        <table border="1">
                            <tr>
                                <td>Tutorial Name</td>
                                <td>Prerequisites</td>
                                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            </tr>
                            <?php
                                
   
    if(isset($_POST['smtProceed']))
{
    if($_POST['ddlcategory']!="" && $_POST['ddllevel']!="")
    {
        $query="select * from tbltutorial where categoryId='$_POST[ddlcategory]' and difficultyLevelId='$_POST[ddllevel]'";
    }
    else if($_POST['ddlcategory']!="" && $_POST['ddllevel']=="")
    {
        $query="select * from tbltutorial where categoryId='$_POST[ddlcategory]'";
    }
    else if($_POST['ddlcategory']=="" && $_POST['ddllevel']!="")
    {
        $query="select * from tbltutorial where difficultyLevelId='$_POST[ddllevel]'";
    }
    else if($_POST['ddlcategory']=="" && $_POST['ddllevel']=="")
    {
        $query="select * from tbltutorial";
    }
        
}
else
{
    $query="select * from tbltutorial";
}
        $result=mysql_query($query,$con) or die(mysql_error($con));
        while($row=mysql_fetch_object($result))
        {
            echo '<tr><td>'.$row->tutorialTitle.'</td>';
            echo '<td>'.$row->tutorialPrerequisites.'</td>';
            echo '<td><a href="ViewTutorialDetail.php?tid='.$row->tutorialId.'">Proceed</a></td></tr>';
        }


                                    
                                
                                ?>
                           
                            
                            
                        </table>
                    </fieldset>
                </td>
            </tr>
        </table>
    </form>
        </body
  
</html>

                
                    
                    
                    
                    
                    
                    
                    
                    
                    
                            </div>
                          
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
         <tr>
            <td>
               <br/>   
            </td>
            
        </tr>
<?php include "../include/footer.php"; ?>
