<!-- Left Menu Start -->
<ul id="leftpane">
    <?php
    if (isset($_SESSION['usertype']) && $_SESSION['usertype'] == "Admin") {
        ?>
        <li><a href="<?php echo baseurl(); ?>admin/index.php">Home</a></li>	
        <li><a href="<?php echo baseurl(); ?>admin/ManageUser.php">User(s)</a></li>			
        <li><a href="<?php echo baseurl(); ?>admin/ManageProfile.php">Profile</a></li>
        <li><a href="<?php echo baseurl(); ?>admin/ManageCategory.php">Categories</a></li>
        <li><a href="<?php echo baseurl(); ?>admin/ManageDifficultyLevel.php">Difficulty&nbsp;Level</a></li>
        <li><a href="<?php echo baseurl(); ?>admin/ManageTutorial.php">Tutorial(s)</a></li>
        <li><a href="<?php echo baseurl(); ?>admin/TutorialReport.php">Tutorial&nbsp;Report</a></li>

        <li><a href="<?php echo baseurl(); ?>admin/aboutus.php">About&nbsp;Us</a></li>
        <li><a href="<?php echo baseurl(); ?>admin/contactus.php">Contact&nbsp;Us</a></li>
        <?php
    } else if (isset($_SESSION['usertype']) && $_SESSION['usertype'] == "Operator") {
        ?>
        <li><a href="<?php echo baseurl(); ?>operator/index.php">Home</a></li>		
        <li><a href="<?php echo baseurl(); ?>operator/ManageProfile.php">Profile</a></li>
        <li><a href="<?php echo baseurl(); ?>operator/ManageCategory.php">Categories</a></li>
        <li><a href="<?php echo baseurl(); ?>operator/ManageDifficultyLevel.php">Difficulty Level</a></li>
        <li><a href="<?php echo baseurl(); ?>operator/ManageTutorial.php">Tutorial(s)</a></li>
        <li><a href="<?php echo baseurl(); ?>operator/TutorialReport.php">Report</a></li>

        <li><a href="<?php echo baseurl(); ?>operator/aboutus.php">About&nbsp;Us</a></li>
        <li><a href="<?php echo baseurl(); ?>operator/contactus.php">Contact&nbsp;Us</a></li>
    <?php
} else {
    ?>
        <li><a href="<?php echo baseurl(); ?>guest/index.php">Home</a></li>	
        <li><a href="<?php echo baseurl(); ?>guest/aboutus.php">About&nbsp;Us</a></li>
        <li><a href="<?php echo baseurl(); ?>guest/contactus.php">Contact&nbsp;Us</a></li>
        <li><a href="<?php echo baseurl(); ?>guest/ViewTutorial.php">View&nbsp;Tutorials</a></li>			
        <?php
    }
    ?>
</ul>
<!-- Left Menu End -->
