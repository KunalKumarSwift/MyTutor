<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
if (isset($_POST['smtProceed'])) {
    $date1 = $_POST['txtdate1'] ?? '';
    $date2 = $_POST['txtdate2'] ?? '';
    $stmt = $pdo->prepare(
        "SELECT u.usrId,u.usrName,c.categoryTitle,t.tutorialTitle,d.difficultyLevelTitle,t.tutorialCreateDate
         FROM tbluser u
         JOIN tbltutorial t ON u.usrId=t.usrId
         JOIN tblcategory c ON c.categoryId=t.categoryId
         JOIN tbldifficultylevel d ON d.difficultyLevelId=t.difficultyLevelId
         WHERE t.tutorialCreateDate BETWEEN ? AND ?"
    );
    $stmt->execute([$date1, $date2]);
} else {
    $stmt = $pdo->query(
        "SELECT u.usrId,u.usrName,c.categoryTitle,t.tutorialTitle,d.difficultyLevelTitle,t.tutorialCreateDate
         FROM tbluser u
         JOIN tbltutorial t ON u.usrId=t.usrId
         JOIN tblcategory c ON c.categoryId=t.categoryId
         JOIN tbldifficultylevel d ON d.difficultyLevelId=t.difficultyLevelId"
    );
}
$tutorials = $stmt->fetchAll();
?>
<tr>
    <td class="lineStyle"></td>
</tr>
<tr>
    <td valign="top">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" id="innerContainer">
            <tr>
                <td width="200px" valign="top"><br><br>
                    <?php include "../include/leftmenu.php"; ?>
                </td>
                <td valign="middle" width="700px">
                    <div style="margin:0 auto;text-align:center;">
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
                                                                    <td>From</td>
                                                                    <td><input type="date" name="txtdate1" value="<?= h($_POST['txtdate1'] ?? '') ?>"></td>
                                                                    <td>To</td>
                                                                    <td><input type="date" name="txtdate2" value="<?= h($_POST['txtdate2'] ?? '') ?>"></td>
                                                                    <td><input type="submit" name="smtProceed" value="Proceed"></td>
                                                                    <td><input type="reset" value="Reset"></td>
                                                                </tr>
                                                            </table>
                                                        </fieldset>
                                                        <table align="center" border="1">
                                                            <tr>
                                                                <td>User Id</td>
                                                                <td>Name</td>
                                                                <td>Category</td>
                                                                <td>Tutorial Title</td>
                                                                <td>Difficulty Level</td>
                                                                <td>Date</td>
                                                            </tr>
                                                            <?php foreach ($tutorials as $t): ?>
                                                                <tr>
                                                                    <td><?= h($t->usrId) ?></td>
                                                                    <td><?= h($t->usrName) ?></td>
                                                                    <td><?= h($t->categoryTitle) ?></td>
                                                                    <td><?= h($t->tutorialTitle) ?></td>
                                                                    <td><?= h($t->difficultyLevelTitle) ?></td>
                                                                    <td><?= h($t->tutorialCreateDate) ?></td>
                                                                </tr>
                                                            <?php endforeach; ?>
                                                        </table>
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
