<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$catId  = $_POST['select_Category']   ?? '';
$lvlId  = $_POST['select_Level']      ?? '';
$search = $_POST['txtTutorial_Title'] ?? '';

$sql    = "SELECT t.tutorialId,t.tutorialTitle,t.tutorialPrerequisites,t.tutorialStatus,
                  c.categoryTitle,d.difficultyLevelTitle
           FROM tbltutorial t
           JOIN tblcategory c ON c.categoryId=t.categoryId
           JOIN tbldifficultylevel d ON d.difficultyLevelId=t.difficultyLevelId
           WHERE t.tutorialTitle LIKE ?";
$params = ['%' . $search . '%'];

if ($catId !== '') { $sql .= ' AND t.categoryId = ?';        $params[] = (int)$catId; }
if ($lvlId !== '') { $sql .= ' AND t.difficultyLevelId = ?'; $params[] = (int)$lvlId; }

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tutorials = $stmt->fetchAll();

$stmtCat = $pdo->query("SELECT categoryId,categoryTitle FROM tblcategory WHERE categoryStatus='Active'");
$categories = $stmtCat->fetchAll();

$stmtLvl = $pdo->query("SELECT difficultyLevelId,difficultyLevelTitle FROM tbldifficultylevel WHERE difficultyLevelStatus='Active'");
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
                        <form id="frmManage_Tutorial" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Manage Tutorials</legend>
                                            <table>
                                                <tr>
                                                    <td><input type="button" value="Add New" onclick="window.location.href='AddTutorial.php'"></td>
                                                </tr>
                                                <tr>
                                                    <td>Category</td>
                                                    <td>
                                                        <select name="select_Category">
                                                            <option value="">-All Category-</option>
                                                            <?php foreach ($categories as $cat): ?>
                                                                <option value="<?= (int)$cat->categoryId ?>"
                                                                    <?= ($catId == $cat->categoryId) ? 'selected' : '' ?>>
                                                                    <?= h($cat->categoryTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select name="select_Level">
                                                            <option value="">-All Level-</option>
                                                            <?php foreach ($levels as $lvl): ?>
                                                                <option value="<?= (int)$lvl->difficultyLevelId ?>"
                                                                    <?= ($lvlId == $lvl->difficultyLevelId) ? 'selected' : '' ?>>
                                                                    <?= h($lvl->difficultyLevelTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Tutorial Title</td>
                                                    <td><input type="text" name="txtTutorial_Title" value="<?= h($search) ?>"></td>
                                                    <td><input type="submit" name="smtSearch" value="Search"></td>
                                                    <td><input type="reset" value="Reset"></td>
                                                </tr>
                                            </table>
                                            <table border="1">
                                                <tr>
                                                    <td>Tutorial Title</td>
                                                    <td>Category</td>
                                                    <td>Level</td>
                                                    <td>Prerequisites</td>
                                                    <td>Status</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <?php foreach ($tutorials as $t): ?>
                                                    <tr>
                                                        <td><?= h($t->tutorialTitle) ?></td>
                                                        <td><?= h($t->categoryTitle) ?></td>
                                                        <td><?= h($t->difficultyLevelTitle) ?></td>
                                                        <td><?= h($t->tutorialPrerequisites) ?></td>
                                                        <td><?= h($t->tutorialStatus) ?></td>
                                                        <td><a href="EditTutorial.php?tid=<?= (int)$t->tutorialId ?>">EDIT</a></td>
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
