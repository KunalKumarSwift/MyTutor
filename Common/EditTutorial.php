<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
$tid = (int)($_GET['tid'] ?? 0);

$fetch = function(int $id) use ($pdo): ?object {
    $s = $pdo->prepare(
        "SELECT t.*,c.categoryTitle,d.difficultyLevelTitle FROM tbltutorial t
         JOIN tblcategory c ON c.categoryId=t.categoryId
         JOIN tbldifficultylevel d ON d.difficultyLevelId=t.difficultyLevelId
         WHERE t.tutorialId=?"
    );
    $s->execute([$id]);
    return $s->fetchObject() ?: null;
};
$row = $fetch($tid);

if (isset($_POST['smtUpdate'])) {
    $catId  = (int)($_POST['select1']          ?? 0);
    $lvlId  = (int)($_POST['select2']          ?? 0);
    $title  = trim($_POST['txtTutorial_Title'] ?? '');
    $prereq = trim($_POST['txtPrerequities']   ?? '');
    $desc   = trim($_POST['txtDesc']           ?? '');
    $status = $_POST['Status'] ?? 'Active';

    $stmt = $pdo->prepare(
        "UPDATE tbltutorial SET categoryId=?,difficultyLevelId=?,tutorialTitle=?,
         tutorialPrerequisites=?,tutorialDesc=?,tutorialStatus=? WHERE tutorialId=?"
    );
    $stmt->execute([$catId, $lvlId, $title, $prereq, $desc, $status, $tid]);
    $msg = 'Record updated successfully.';
    $row = $fetch($tid);
}

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
                        <form id="frmEdit_Tutorial" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Edit Tutorial</legend>
                                            <table>
                                                <tr>
                                                    <td>Category</td>
                                                    <td>
                                                        <select name="select1">
                                                            <?php foreach ($categories as $cat): ?>
                                                                <option value="<?= (int)$cat->categoryId ?>"
                                                                    <?= ($cat->categoryId == ($row->categoryId ?? 0)) ? 'selected' : '' ?>>
                                                                    <?= h($cat->categoryTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Level</td>
                                                    <td>
                                                        <select name="select2">
                                                            <?php foreach ($levels as $lvl): ?>
                                                                <option value="<?= (int)$lvl->difficultyLevelId ?>"
                                                                    <?= ($lvl->difficultyLevelId == ($row->difficultyLevelId ?? 0)) ? 'selected' : '' ?>>
                                                                    <?= h($lvl->difficultyLevelTitle) ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Tutorial Title</td>
                                                    <td><input type="text" name="txtTutorial_Title" value="<?= h($row->tutorialTitle ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Prerequisites</td>
                                                    <td><textarea name="txtPrerequities" rows="3" cols="20"><?= h($row->tutorialPrerequisites ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Description</td>
                                                    <td><textarea name="txtDesc" rows="9" cols="40"><?= h($row->tutorialDesc ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td>
                                                        <input type="radio" name="Status" value="Active" <?= (($row->tutorialStatus ?? '') === 'Active') ? 'checked' : '' ?>> Active
                                                        <input type="radio" name="Status" value="Inactive" <?= (($row->tutorialStatus ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <input type="submit" name="smtUpdate" value="Update">
                                                        <input type="reset" value="Reset">
                                                        <input type="button" value="Cancel" onclick="history.back()">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2"><div style="color:red"><?= h($msg) ?></div></td>
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
