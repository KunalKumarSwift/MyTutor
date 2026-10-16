<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php //include "checksession.php";?>

<?php
if(isset($_GET['uid']))
{
    
    $query="update tbluser set usrStatus=if(usrStatus='Active','Inactive','Active') where usrId='$_GET[uid]'";
    
    $result=mysql_query($query);
    
    header('location:ManageUser.php');

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
                             
                 <form id="frmManage_Users" method="post">
            <table  align="center">
                <tr>
                    <td>
                        <fieldset>
                            <legend>
                                Manage Users
                            </legend>
                            <table>
                                <tr>
                                    <td><input type="button" id="btnAdd" name="btnAdd" value="Add New" onclick="window.location.href='AddUser.php'"></td>
                                    <td>&nbsp;</td>
                                    <td><label id="lblName_Search">Name</label>
                                        <input type="text" id="txtSearch" name="txtSearch">
                                        <input type="submit" id="btnSearch" name="btnSearch" value="Search">
                                     </td>
                                        
                                </tr>
                                <tr>
                                    <td>
                                        <div id="divMsg"><?php  echo $count; ?> users found!!!</div>
                                    </td>
                                </tr>
                            </table>
                            <table border="1">
                            
                                <tr>
                                    <td>User Id</td>
                                    <td>Name</td>
                                    <td>DOB</td>
                                    <td>Gender</td>
                                    <td>Email</td>
                                    <td>Mobile</td>
                                    <td>Status</td>
                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                </tr>
                                
                                
                                    <?php
                                    
                                    $query="select usrId,usrName,usrDOB,usrGender,usrEmail,usrMobile,usrStatus from tbluser where usrName like '%$_POST[txtSearch]%'";
                                    $result=mysql_query($query,$con) or die(mysql_error($con));
                                    
                                    while($row=mysql_fetch_object($result))
                                    {
                                        
                                        echo '<tr><td>'.$row->usrId.'</td>';
                                        echo '<td>'.$row->usrName.'</td>';
                                        echo '<td>'.$row->usrDOB.'</td>';
                                        echo '<td>'.$row->usrGender.'</td>';
                                        echo '<td>'.$row->usrEmail.'</td>';
                                        echo '<td>'.$row->usrMobile.'</td>';
                                        echo '<td>'.$row->usrStatus.'&nbsp;&nbsp;<a href="ManageUser.php?uid='.$row->usrId.'">CHANGE</a></td>';
                                        echo '<td><a href="'.baseurl().'admin/EditUser.php?mid='.$row->usrId.'">[EDIT]</a></td></tr>';
                                    
                                        
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