<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$search = $_POST['txtDifficulty'] ?? '';
$stmt = $pdo->prepare(
    "SELECT difficultyLevelId,difficultyLevelTitle,difficultyLevelDesc,difficultyLevelStatus
     FROM tbldifficultylevel WHERE difficultyLevelTitle LIKE ?"
);
$stmt->execute(['%' . $search . '%']);
$levels = $stmt->fetchAll();
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
                        <form id="frmManage_Difficulty_Level" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Manage Difficulty Level</legend>
                                            <table>
                                                <tr>
                                                    <td><input type="button" value="Add New" onclick="window.location.href='AddDifficultyLevel.php'"></td>
                                                    <td>Difficulty Level</td>
                                                    <td><input type="text" name="txtDifficulty" value="<?= h($search) ?>"></td>
                                                    <td><input type="submit" name="smtSearch" value="Search"></td>
                                                </tr>
                                            </table>
                                            <table border="1" align="center" class="tblStyle">
                                                <tr>
                                                    <td>Difficulty Level</td>
                                                    <td>Description</td>
                                                    <td>Status</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <?php foreach ($levels as $lvl): ?>
                                                    <tr>
                                                        <td><?= h($lvl->difficultyLevelTitle) ?></td>
                                                        <td><?= h($lvl->difficultyLevelDesc) ?></td>
                                                        <td><?= h($lvl->difficultyLevelStatus) ?></td>
                                                        <td><a href="EditDifficultyLevel.php?did=<?= (int)$lvl->difficultyLevelId ?>">EDIT</a></td>
                                                    </tr>
                                                <?php endforeach; ?>
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
