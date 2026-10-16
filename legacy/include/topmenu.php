<?php //end of left menu code 	  ?>
<tr>
    <td>
        <ul id="sitenav" class="clearfix">
            <?php
            if (isset($_SESSION['usertype']) && $_SESSION['usertype'] == "Admin") {
                ?>
                <li><a href="<?php echo baseurl(); ?>admin/index.php">Home</a></li>	
                <li><a href="<?php echo baseurl(); ?>admin/tutorialreport.php">Tutorial Report</a></li>
                <li><a href="<?php echo baseurl(); ?>admin/ChangePassword.php">Change Password</a></li>
                <li><a href="<?php echo baseurl(); ?>admin/aboutus.php">About Us</a></li>
                <li><a href="<?php echo baseurl(); ?>admin/contactus.php">Contact Us</a></li>
                <?php
            } else if (isset($_SESSION['usertype']) && $_SESSION['usertype'] == "Operator") {
                ?>
                <li><a href="<?php echo baseurl(); ?>operator/index.php">Home</a></li>		
                <li><a href="<?php echo baseurl(); ?>operator/tutorialreport.php">Tutorial Report</a></li>
                <li><a href="<?php echo baseurl(); ?>operator/ChangePassword.php">Change Password</a></li>
                <li><a href="<?php echo baseurl(); ?>operator/aboutus.php">About Us</a></li>
                <li><a href="<?php echo baseurl(); ?>operator/contactus.php">Contact Us</a></li>
    <?php
} else {
    ?>
                <li><a href="<?php echo baseurl(); ?>guest/index.php">Home</a></li>	
                <li><a href="<?php echo baseurl(); ?>guest/aboutus.php">About Us</a></li>
                <li><a href="<?php echo baseurl(); ?>guest/contactus.php">Contact Us</a></li>
                <li><a href="<?php echo baseurl(); ?>guest/viewtutorial.php">View Tutorials</a></li>			
                <?php
            }
            ?>
        </ul>
    </td>
</tr>