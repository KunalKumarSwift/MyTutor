<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php include "checksession.php"; ?>
<?php
$uid = $_GET['mid'] ?? '';
$msg = '';

$stmt = $pdo->prepare(
    "SELECT usrId,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile FROM tbluser WHERE usrId=?"
);
$stmt->execute([$uid]);
$row = $stmt->fetchObject();

if (isset($_POST['smtUpdate'])) {
    $pwd     = $_POST['txtPassword']         ?? '';
    $confirm = $_POST['txtConfirm_Password'] ?? '';
    $status  = $_POST['Status']              ?? 'Active';
    $name    = trim($_POST['txtName']        ?? '');
    $dob     = trim($_POST['txtDOB']         ?? '');
    $gender  = $_POST['Gender']              ?? 'Male';
    $email   = trim($_POST['txtEmail']       ?? '');
    $address = trim($_POST['txtAddress']     ?? '');
    $mobile  = trim($_POST['txtMobile']      ?? '');

    if ($pwd !== '' && $pwd !== $confirm) {
        $msg = 'Passwords do not match.';
    } else {
        if ($pwd !== '') {
            $hash = password_hash($pwd, PASSWORD_BCRYPT);
            $upd  = $pdo->prepare(
                "UPDATE tbluser SET usrPwd=?,usrStatus=?,usrName=?,usrDOB=?,usrGender=?,
                 usrEmail=?,usrAddress=?,usrMobile=? WHERE usrId=?"
            );
            $upd->execute([$hash, $status, $name, $dob, $gender, $email, $address, $mobile, $uid]);
        } else {
            $upd = $pdo->prepare(
                "UPDATE tbluser SET usrStatus=?,usrName=?,usrDOB=?,usrGender=?,
                 usrEmail=?,usrAddress=?,usrMobile=? WHERE usrId=?"
            );
            $upd->execute([$status, $name, $dob, $gender, $email, $address, $mobile, $uid]);
        }
        header('Location: ' . baseurl() . 'admin/ManageUser.php');
        exit;
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
                        <form id="frmEdit_User" method="post">
                            <table align="center">
                                <tr>
                                    <td colspan="3">
                                        <fieldset>
                                            <legend>Account Information</legend>
                                            <table>
                                                <tr>
                                                    <td>User Id</td>
                                                    <td colspan="4"><?= h($row->usrId ?? '') ?></td>
                                                </tr>
                                                <tr>
                                                    <td>New Password</td>
                                                    <td colspan="4"><input type="password" name="txtPassword" placeholder="Leave blank to keep current"></td>
                                                </tr>
                                                <tr>
                                                    <td>Confirm Password</td>
                                                    <td colspan="4"><input type="password" name="txtConfirm_Password"></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td><input type="radio" name="Status" value="Active" <?= (($row->usrStatus ?? '') === 'Active') ? 'checked' : '' ?>> Active</td>
                                                    <td><input type="radio" name="Status" value="Inactive" <?= (($row->usrStatus ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive</td>
                                                </tr>
                                            </table>
                                        </fieldset>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="3">
                                        <fieldset>
                                            <legend>Personal Information</legend>
                                            <table>
                                                <tr>
                                                    <td>Name</td>
                                                    <td colspan="4"><input type="text" name="txtName" value="<?= h($row->usrName ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Date of Birth</td>
                                                    <td colspan="4"><input type="text" name="txtDOB" value="<?= h($row->usrDOB ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Gender</td>
                                                    <td><input type="radio" name="Gender" value="Male" <?= (($row->usrGender ?? '') === 'Male') ? 'checked' : '' ?>> Male</td>
                                                    <td><input type="radio" name="Gender" value="Female" <?= (($row->usrGender ?? '') === 'Female') ? 'checked' : '' ?>> Female</td>
                                                </tr>
                                                <tr>
                                                    <td>Email</td>
                                                    <td colspan="4"><input type="email" name="txtEmail" value="<?= h($row->usrEmail ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Address</td>
                                                    <td colspan="4"><input type="text" name="txtAddress" value="<?= h($row->usrAddress ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Mobile</td>
                                                    <td colspan="4"><input type="text" name="txtMobile" value="<?= h($row->usrMobile ?? '') ?>"></td>
                                                </tr>
                                            </table>
                                        </fieldset>
                                    </td>
                                </tr>
                                <tr>
                                    <td><input type="submit" name="smtUpdate" value="Update"></td>
                                    <td><input type="reset" value="Reset"></td>
                                    <td><input type="button" value="Cancel" onclick="history.back()"></td>
                                </tr>
                                <?php if ($msg): ?>
                                    <tr><td colspan="3" style="color:red"><?= h($msg) ?></td></tr>
                                <?php endif; ?>
                            </table>
                        </form>
                    </div>
                </td>
            </tr>
        </table>
    </td>
</tr>
<?php include "../include/footer.php"; ?>
