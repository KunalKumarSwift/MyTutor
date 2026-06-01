<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$catId = $_POST['ddlcategory'] ?? '';
$lvlId = $_POST['ddllevel']    ?? '';

$sql    = "SELECT tutorialId,tutorialTitle,tutorialPrerequisites FROM tbltutorial WHERE 1=1";
$params = [];
if ($catId !== '') { $sql .= ' AND categoryId=?';        $params[] = (int)$catId; }
if ($lvlId !== '') { $sql .= ' AND difficultyLevelId=?'; $params[] = (int)$lvlId; }

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tutorials = $stmt->fetchAll();

$stmtCat = $pdo->query("SELECT categoryId,categoryTitle FROM tblcategory");
$categories = $stmtCat->fetchAll();

$stmtLvl = $pdo->query("SELECT difficultyLevelId,difficultyLevelTitle FROM tbldifficultylevel");
$levels = $stmtLvl->fetchAll();
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
                        <form id="frmViewTutorial" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>View Tutorials</legend>
                                            <table>
                                                <tr>
                                                    <td>Category
                                                        <select name="ddlcategory">
                                                            <option value="">-Select-</option>
                                                            <?php foreach ($categories as $cat): ?>
                                                                <option value="<?= (int)$cat->categoryId ?>"
                                                                    <?= ($catId == $cat->categoryId) ? 'selected' : '' ?>>
                                                                    <?= h($cat->categoryTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Level
                                                        <select name="ddllevel">
                                                            <option value="">-Select-</option>
                                                            <?php foreach ($levels as $lvl): ?>
                                                                <option value="<?= (int)$lvl->difficultyLevelId ?>"
                                                                    <?= ($lvlId == $lvl->difficultyLevelId) ? 'selected' : '' ?>>
                                                                    <?= h($lvl->difficultyLevelTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr align="center">
                                                    <td>
                                                        <input type="submit" name="smtProceed" value="Proceed">
                                                        <input type="reset" value="Reset">
                                                    </td>
                                                </tr>
                                            </table>
                                            <table border="1">
                                                <tr>
                                                    <td>Tutorial Name</td>
                                                    <td>Prerequisites</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <?php foreach ($tutorials as $t): ?>
                                                    <tr>
                                                        <td><?= h($t->tutorialTitle) ?></td>
                                                        <td><?= h($t->tutorialPrerequisites) ?></td>
                                                        <td><a href="ViewTutorialDetail.php?tid=<?= (int)$t->tutorialId ?>">Proceed</a></td>
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
