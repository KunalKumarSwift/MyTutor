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
        
                                 
                                 <form id="frmManage_Category" method="post">
        <table>
            <tr>
                <td>
                    <fieldset>
                        <legend>Manage Category</legend>
                        <table>
                            <tr>
                                <td><input type="button" id="smtAddNew" name="smtAddNew" value="Add New" onclick="window.location.href='AddCategory.php'"></td>
                                <td><label id="lblCategory">Category</label></td>
                                <td><input type="text" id="txtCategory" name="txtCategory"></td>
                                <td><input type="submit" id="smtSearch" name="smtSearch" value="Search"></td>
                            </tr>
                        </table>
                        <table border="1" align="center">
                            <tr>
                                <td>Category</td>
                                <td>Description</td>
                                <td>Status</td>
                                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            </tr>
                            
                            <?php

                            $query="select categoryId,categoryTitle,categoryDesc,categoryStatus from tblcategory where categoryTitle like'%".$_POST['txtCategory']."%'";
                            $result=mysql_query($query,$con) or die(mysql_error($con));
                            while($row=  mysql_fetch_object($result))
                                {
                                    echo '<tr><td>'.$row->categoryTitle.'</td>';
                                    echo '<td>'.$row->categoryDesc.'</td>';
                                    echo '<td>'.$row->categoryStatus.'</td>';
                                    echo'<td><a href=EditCategory.php?cid='.$row->categoryId.'>EDIT</a></td></tr>';


                                }


?>


                            
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
