<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
if (isset($_POST['smtSave']) || isset($_POST['smtSave_Add'])) {
    $title  = trim($_POST['txtDifficulty_Level'] ?? '');
    $desc   = trim($_POST['txtDesc']             ?? '');
    $status = $_POST['kk'] ?? 'Active';

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tbldifficultylevel WHERE difficultyLevelTitle = ?");
    $stmt->execute([$title]);
    if ((int)$stmt->fetchColumn() > 0) {
        $msg = 'Difficulty level already exists.';
    } else {
        $stmt = $pdo->prepare(
            "INSERT INTO tbldifficultylevel (difficultyLevelTitle,difficultyLevelDesc,difficultyLevelStatus) VALUES (?,?,?)"
        );
        $stmt->execute([$title, $desc, $status]);
        if (isset($_POST['smtSave'])) {
            header('Location: ManageDifficultyLevel.php');
            exit;
        }
        $msg = 'Difficulty level added successfully.';
    }
}
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
                        <form id="frmAdd_Difficulty_Level" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Add Difficulty Level</legend>
                                            <table>
                                                <tr>
                                                    <td>Difficulty Level</td>
                                                    <td colspan="3"><input type="text" name="txtDifficulty_Level" value="<?= h($_POST['txtDifficulty_Level'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Description</td>
                                                    <td colspan="3"><textarea rows="3" cols="20" name="txtDesc"><?= h($_POST['txtDesc'] ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td><input type="radio" name="kk" value="Active" <?= (($_POST['kk'] ?? 'Active') === 'Active') ? 'checked' : '' ?>> Active</td>
                                                    <td><input type="radio" name="kk" value="Inactive" <?= (($_POST['kk'] ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive</td>
                                                </tr>
                                                <tr>
                                                    <td><input type="submit" name="smtSave" value="Save"></td>
                                                    <td><input type="submit" name="smtSave_Add" value="Save &amp; Add New"></td>
                                                    <td><input type="reset" value="Reset"></td>
                                                    <td><input type="button" value="Cancel" onclick="history.back()"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="4"><div style="color:red"><?= h($msg) ?></div></td>
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
