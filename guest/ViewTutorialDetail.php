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
                                  <title>View Tutorial Detail</title>
                              </head>
                              <body>
                                  <form id="frmView_Tutorial_Detail" method="post">
                                      <table align="center">
                                          <tr>
                                              <td>
                                                  <input type="button" id="btnBack" name="btnBack" value="Back" onclick="window.location.href='ViewTutorial.php'">
                                                  <fieldset>
                                                      <legend>Tutorial Info</legend>
                                                      <table>
                                                          <?php  
                                                          
                                                          $k=$_GET['tid'];
$query="select * from tblcategory a,tbldifficultylevel b,tbltutorial c where a.categoryId=c.categoryId and b.difficultyLevelId=c.difficultyLevelId and c.tutorialId='$k'";
$result= mysql_query($query,$con) or die(mysql_error($con));
while($row=mysql_fetch_object($result))
{
    ?>
      
                                                          
                                                          
                                                          <tr>
                                                              <td>Tutorial Title</td><td><label id="lblTutorial_Title" name="lblTutorial_Title"><?php echo $row->tutorialTitle; ?></label></td></tr>
                                                              <tr><td>Create Date</td><td><label id="lblCreate_Date" name="lblCreate_Date"><?php echo $row->tutorialCreateDate; ?></label></td></tr>
                                                              <tr><td>Category</td><td><label id="lblCategory" name="lblCategory"><?php echo $row->categoryTitle; ?></label></td></tr>
                                                              <tr><td>Difficulty Level</td><td><label id="lblDifficulty_Level" name="lblDifficulty_Level"><?php echo $row->difficultyLevelTitle; ?></label></td></tr>
                                                              <tr><td>Prerequisites</td><td><label id="lblPrerequities" name="lblPrerequities"><?php echo $row->tutorialPrerequisites; }?></label></td></tr>
                                                             
                                                          
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