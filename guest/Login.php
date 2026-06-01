<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>

<?php


$msg = "";
$flag=0;
if (isset($_POST['smtLogin'])) {
    $query = "select usrId,usrPwd,usrName,usrType,usrStatus from tbluser where usrId='$_POST[txtUserId]'";
    $result = mysql_query($query, $con) or die(mysql_error($con));
    if (mysql_num_rows($result) > 0) 
        {
                $row = mysql_fetch_object($result);
                if ($row->usrPwd == $_POST['txtPassword']) 
                    {
                            if ($row->usrStatus == "Active") 
                                {
                                        $_SESSION['userid'] = $row->usrId;
                                        $_SESSION['username'] = $row->usrName;
                                        $_SESSION['usertype'] = $row->usrType;
                                        if ($row->usrType == "Admin") 
                                            {
                                                header('location:' . baseurl() . 'admin/index.php');
                                            } 
                                            else 
                                            {
                                                header('location:' . baseurl() . 'operator/index.php');
                                            }
                                }
                           else 
                                {
                                    $msg = "your login has been Expired.";
                                }
                    } 
               else 
                   {
                        $msg = ("Invalid UserName/Password.");
           
                   }
    }
 else {
        $msg = ("Invalid UserName/Password.");
        
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
                             
                    <label style="color:red; font-size: 24px; text-decoration: underline; font-weight: bold;">Guest Home</label>
                
                    
                    
                         <form id="frmLogin" method="post" onsubmit="return check();">
            <div id="divLogin" align="center" style="color:red" >Login</div>
            <table align="center">
                <tr>
                    
                    <td>
                        <fieldset>
                            <legend>
                                Login
                            </legend>

                            <table>
                                <tr>
                                    <td style="color:red"><?php echo $msg;?></td>
                                </tr>
                                <tr>
                                    <td><label id="lblUserId">User Id</label>
                                        <span id="spnUserId" style="color:red"></span></td>
                                    <td> <input type="text" id="txtUserId" name="txtUserId"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <label id="lbPassword">Password</label>
                                        <span id="spnPassword" style="color:red"></span></td>
                                    <td><input type="password" id="txtPassword" name="txtPassword"></td>

                                </tr>
                                <tr>
                                    <td colspan="2" align="center"><input type="submit" id="smtLogin" name="smtLogin" value="Login"></td>
                                </tr>
                                <tr>
                                    <td colspan="2" align="center"><a href="<?php echo baseurl();?>Password_Recovery.php" style="color:royalblue">Forgot your password</a></td>
                                    
                                </tr>
                                <tr><td>
                                <div id="divmsg" style="color:red">
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
<?php include "../include/footer.php"; ?>s