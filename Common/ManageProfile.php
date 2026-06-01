<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
if (isset($_POST['smtUpdate'])) {
    $name    = trim($_POST['txtName']    ?? '');
    $dob     = trim($_POST['txtDOB']     ?? '');
    $gender  = $_POST['Gender']          ?? '';
    $address = trim($_POST['txtAddress'] ?? '');
    $mobile  = trim($_POST['txtMobile']  ?? '');
    $email   = trim($_POST['txtEmail']   ?? '');

    if ($name && $dob && $address && $mobile && $email) {
        $stmt = $pdo->prepare(
            "UPDATE tbluser SET usrName=?,usrDOB=?,usrGender=?,usrAddress=?,usrMobile=?,usrEmail=?
             WHERE usrId=?"
        );
        $stmt->execute([$name, $dob, $gender, $address, $mobile, $email, $_SESSION['userid']]);
        if (($_SESSION['usertype'] ?? '') === 'Admin') {
            header('Location: ' . baseurl() . 'admin/index.php');
        } else {
            header('Location: ' . baseurl() . 'operator/index.php');
        }
        exit;
    }
}

$stmt = $pdo->prepare(
    "SELECT usrId,usrName,usrDOB,usrGender,usrAddress,usrMobile,usrEmail FROM tbluser WHERE usrId=?"
);
$stmt->execute([$_SESSION['userid']]);
$row = $stmt->fetchObject();
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
                        <form id="frmManage_Profile" method="post">
                            <table align="center">
                                <tr>
                                    <td colspan="3">
                                        <fieldset>
                                            <legend>Account Information</legend>
                                            <table>
                                                <tr>
                                                    <td>User Id</td>
                                                    <td><?= h($_SESSION['userid'] ?? '') ?></td>
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
                                                    <td>Name <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtName" value="<?= h($row->usrName ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Date of Birth <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtDOB" value="<?= h($row->usrDOB ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Gender</td>
                                                    <td><input type="radio" name="Gender" value="Male" <?= (($row->usrGender ?? '') === 'Male') ? 'checked' : '' ?>> Male</td>
                                                    <td><input type="radio" name="Gender" value="Female" <?= (($row->usrGender ?? '') === 'Female') ? 'checked' : '' ?>> Female</td>
                                                </tr>
                                                <tr>
                                                    <td>Email <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="email" name="txtEmail" value="<?= h($row->usrEmail ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Address <span style="color:red">*</span></td>
                                                    <td colspan="4"><input type="text" name="txtAddress" value="<?= h($row->usrAddress ?? '') ?>"></td>
                                                </tr>
                                                <tr>
                                                    <td>Mobile <span style="color:red">*</span></td>
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
                            </table>
                        </form>
                    </div>
                </td>
            </tr>
        </table>
    </td>
</tr>
<?php include "../include/footer.php"; ?>
