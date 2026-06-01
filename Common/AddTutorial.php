<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
if (isset($_POST['smtSave']) || isset($_POST['smtSave_Add'])) {
    $title  = trim($_POST['txtTutorial_Title'] ?? '');
    $desc   = trim($_POST['txtDesc']           ?? '');
    $catId  = (int)($_POST['select_Category']  ?? 0);
    $lvlId  = (int)($_POST['select_Level']     ?? 0);
    $prereq = trim($_POST['txtPrerequities']   ?? '');
    $status = $_POST['Status'] ?? 'Active';

    $stmt = $pdo->prepare(
        "INSERT INTO tbltutorial
         (tutorialTitle,tutorialDesc,categoryId,difficultyLevelId,tutorialPrerequisites,tutorialCreateDate,tutorialStatus,usrId)
         VALUES (?,?,?,?,?,NOW(),?,?)"
    );
    $stmt->execute([$title, $desc, $catId, $lvlId, $prereq, $status, $_SESSION['userid']]);

    if (isset($_POST['smtSave'])) {
        header('Location: ManageTutorial.php');
        exit;
    }
    $msg = 'Tutorial added successfully.';
}

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
                        <form id="frmAdd_Tutorial" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Add Tutorial</legend>
                                            <table>
                                                <tr>
                                                    <td>Category</td>
                                                    <td>
                                                        <select name="select_Category">
                                                            <option value="">-Select Category-</option>
                                                            <?php foreach ($categories as $cat): ?>
                                                                <option value="<?= (int)$cat->categoryId ?>"><?= h($cat->categoryTitle) ?></option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Level</td>
                                                    <td>
                                                        <select name="select_Level">
                                                            <option value="">-Select Level-</option>
                                                            <?php foreach ($levels as $lvl): ?>
                                                                <option value="<?= (int)$lvl->difficultyLevelId ?>"><?= h($lvl->difficultyLevelTitle) ?></option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Tutorial Title</td>
                                                    <td><input type="text" name="txtTutorial_Title" value="<?= h($_POST['txtTutorial_Title'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Prerequisites</td>
                                                    <td><textarea name="txtPrerequities" rows="3" cols="20"><?= h($_POST['txtPrerequities'] ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Description</td>
                                                    <td><textarea name="txtDesc" rows="9" cols="40"><?= h($_POST['txtDesc'] ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td>
                                                        <input type="radio" name="Status" value="Active" <?= (($_POST['Status'] ?? 'Active') === 'Active') ? 'checked' : '' ?>> Active
                                                        <input type="radio" name="Status" value="Inactive" <?= (($_POST['Status'] ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <input type="submit" name="smtSave" value="Save">
                                                        <input type="submit" name="smtSave_Add" value="Save &amp; Add New">
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
