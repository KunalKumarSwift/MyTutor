<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$tid = (int)($_GET['tid'] ?? 0);
$stmt = $pdo->prepare(
    "SELECT t.*,c.categoryTitle,d.difficultyLevelTitle FROM tbltutorial t
     JOIN tblcategory c ON c.categoryId=t.categoryId
     JOIN tbldifficultylevel d ON d.difficultyLevelId=t.difficultyLevelId
     WHERE t.tutorialId=?"
);
$stmt->execute([$tid]);
$row = $stmt->fetchObject();
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
                        <form id="frmView_Tutorial_Detail" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <input type="button" value="Back" onclick="window.location.href='ViewTutorial.php'">
                                        <fieldset>
                                            <legend>Tutorial Info</legend>
                                            <?php if ($row): ?>
                                                <table>
                                                    <tr><td>Tutorial Title</td><td><?= h($row->tutorialTitle) ?></td></tr>
                                                    <tr><td>Create Date</td><td><?= h($row->tutorialCreateDate) ?></td></tr>
                                                    <tr><td>Category</td><td><?= h($row->categoryTitle) ?></td></tr>
                                                    <tr><td>Difficulty Level</td><td><?= h($row->difficultyLevelTitle) ?></td></tr>
                                                    <tr><td>Prerequisites</td><td><?= h($row->tutorialPrerequisites) ?></td></tr>
                                                    <tr><td>Description</td><td><?= h($row->tutorialDesc) ?></td></tr>
                                                </table>
                                            <?php else: ?>
                                                <p>Tutorial not found.</p>
                                            <?php endif; ?>
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
