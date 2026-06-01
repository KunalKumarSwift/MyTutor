<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
$did = (int)($_GET['did'] ?? 0);

$stmt = $pdo->prepare("SELECT * FROM tbldifficultylevel WHERE difficultyLevelId = ?");
$stmt->execute([$did]);
$row = $stmt->fetchObject();

if (isset($_POST['smtUpdate'])) {
    $title  = trim($_POST['txtDifficulty_Level'] ?? '');
    $desc   = trim($_POST['txtdesc']             ?? '');
    $status = $_POST['kk'] ?? 'Active';

    $stmt = $pdo->prepare(
        "UPDATE tbldifficultylevel SET difficultyLevelTitle=?,difficultyLevelDesc=?,difficultyLevelStatus=?
         WHERE difficultyLevelId=?"
    );
    $stmt->execute([$title, $desc, $status, $did]);
    header('Location: ManageDifficultyLevel.php');
    exit;
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
                        <form id="frmEdit_Difficulty_Level" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Edit Difficulty Level</legend>
                                            <table>
                                                <tr>
                                                    <td>Difficulty Level</td>
                                                    <td colspan="3"><input type="text" name="txtDifficulty_Level" value="<?= h($row->difficultyLevelTitle ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Description</td>
                                                    <td colspan="3"><textarea rows="3" cols="20" name="txtdesc"><?= h($row->difficultyLevelDesc ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td><input type="radio" name="kk" value="Active" <?= (($row->difficultyLevelStatus ?? '') === 'Active') ? 'checked' : '' ?>> Active</td>
                                                    <td><input type="radio" name="kk" value="Inactive" <?= (($row->difficultyLevelStatus ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive</td>
                                                </tr>
                                                <tr>
                                                    <td><input type="submit" name="smtUpdate" value="Update"></td>
                                                    <td><input type="reset" value="Reset"></td>
                                                    <td><input type="button" value="Cancel" onclick="history.back()"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3"><div style="color:red"><?= h($msg) ?></div></td>
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
