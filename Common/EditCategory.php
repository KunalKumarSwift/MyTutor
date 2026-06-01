<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
$cid = (int)($_GET['cid'] ?? 0);

$stmt = $pdo->prepare("SELECT * FROM tblcategory WHERE categoryId = ?");
$stmt->execute([$cid]);
$row = $stmt->fetchObject();

if (isset($_POST['smtUpdate'])) {
    $title  = trim($_POST['txtCategory']    ?? '');
    $desc   = trim($_POST['txtDescription'] ?? '');
    $status = $_POST['kk'] ?? 'Active';

    $stmt = $pdo->prepare(
        "UPDATE tblcategory SET categoryTitle=?,categoryDesc=?,categoryStatus=? WHERE categoryId=?"
    );
    $stmt->execute([$title, $desc, $status, $cid]);
    header('Location: ManageCategory.php');
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
                        <form id="frmEdit_Category" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Edit Category</legend>
                                            <table>
                                                <tr>
                                                    <td>Category</td>
                                                    <td colspan="3"><input type="text" name="txtCategory" value="<?= h($row->categoryTitle ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Description</td>
                                                    <td colspan="3"><textarea rows="3" cols="20" name="txtDescription"><?= h($row->categoryDesc ?? '') ?></textarea></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td><input type="radio" name="kk" value="Active" <?= (($row->categoryStatus ?? '') === 'Active') ? 'checked' : '' ?>> Active</td>
                                                    <td><input type="radio" name="kk" value="Inactive" <?= (($row->categoryStatus ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive</td>
                                                </tr>
                                                <tr>
                                                    <td><input type="submit" name="smtUpdate" value="Update"></td>
                                                    <td><input type="reset" value="Reset"></td>
                                                    <td><input type="button" value="Cancel" onclick="history.back()"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3"><div style="color:maroon;font-size:20px"><?= h($msg) ?></div></td>
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
