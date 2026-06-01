<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php include "checksession.php"; ?>
<?php
$msg = '';
if (isset($_POST['smtSave']) || isset($_POST['smtSave_Add'])) {
    $userId  = trim($_POST['txtUserId']          ?? '');
    $pwd     = $_POST['txtPassword']              ?? '';
    $confirm = $_POST['txtConfirm_Password']      ?? '';
    $status  = $_POST['Status']                   ?? 'Active';
    $name    = trim($_POST['txtName']             ?? '');
    $dob     = trim($_POST['txtDOB']              ?? '');
    $gender  = $_POST['Gender']                   ?? 'Male';
    $email   = trim($_POST['txtEmail']            ?? '');
    $address = trim($_POST['txtAddress']          ?? '');
    $mobile  = trim($_POST['txtMobile']           ?? '');

    if ($pwd !== $confirm) {
        $msg = 'Passwords do not match.';
    } else {
        $chk = $pdo->prepare("SELECT COUNT(*) FROM tbluser WHERE usrId=?");
        $chk->execute([$userId]);
        if ((int)$chk->fetchColumn() > 0) {
            $msg = 'User ID already exists.';
        } else {
            $hash = password_hash($pwd, PASSWORD_BCRYPT);
            $ins  = $pdo->prepare(
                "INSERT INTO tbluser (usrId,usrPwd,usrType,usrStatus,usrName,usrDOB,usrGender,usrEmail,usrAddress,usrMobile)
                 VALUES (?,?,'Operator',?,?,?,?,?,?,?)"
            );
            $ins->execute([$userId, $hash, $status, $name, $dob, $gender, $email, $address, $mobile]);
            if (isset($_POST['smtSave'])) {
                header('Location: ' . baseurl() . 'admin/ManageUser.php');
                exit;
            }
            $msg = 'User added successfully.';
        }
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
                        <form id="frmAdd_User" method="post">
                            <table align="center">
                                <tr>
                                    <td colspan="4">
                                        <fieldset>
                                            <legend>Account Information</legend>
                                            <table>
                                                <tr>
                                                    <td>User Id <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtUserId" value="<?= h($_POST['txtUserId'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Password <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="password" name="txtPassword"></td>
                                                </tr>
                                                <tr>
                                                    <td>Confirm Password <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="password" name="txtConfirm_Password"></td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td><input type="radio" name="Status" value="Active" <?= (($_POST['Status'] ?? 'Active') === 'Active') ? 'checked' : '' ?>> Active</td>
                                                    <td><input type="radio" name="Status" value="Inactive" <?= (($_POST['Status'] ?? '') === 'Inactive') ? 'checked' : '' ?>> Inactive</td>
                                                </tr>
                                            </table>
                                        </fieldset>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4">
                                        <fieldset>
                                            <legend>Personal Information</legend>
                                            <table>
                                                <tr>
                                                    <td>Name <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtName" value="<?= h($_POST['txtName'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Date of Birth</td>
                                                    <td colspan="4"><input type="text" name="txtDOB" value="<?= h($_POST['txtDOB'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Gender</td>
                                                    <td><input type="radio" name="Gender" value="Male" <?= (($_POST['Gender'] ?? 'Male') === 'Male') ? 'checked' : '' ?>> Male</td>
                                                    <td><input type="radio" name="Gender" value="Female" <?= (($_POST['Gender'] ?? '') === 'Female') ? 'checked' : '' ?>> Female</td>
                                                </tr>
                                                <tr>
                                                    <td>Email <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="email" name="txtEmail" value="<?= h($_POST['txtEmail'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Address</td>
                                                    <td colspan="4"><input type="text" name="txtAddress" value="<?= h($_POST['txtAddress'] ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Mobile <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtMobile" value="<?= h($_POST['txtMobile'] ?? '') ?>"></td>
                                                </tr>
                                            </table>
                                        </fieldset>
                                    </td>
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
                        </form>
                    </div>
                </td>
            </tr>
        </table>
    </td>
</tr>
<?php include "../include/footer.php"; ?>
