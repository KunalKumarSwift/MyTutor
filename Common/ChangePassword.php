<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
if (isset($_POST['smtUpdate'])) {
    $current = $_POST['txtCurrent_Password'] ?? '';
    $new     = $_POST['txtNew_Password']     ?? '';
    $confirm = $_POST['txtConfirm_Password'] ?? '';

    if ($new !== $confirm) {
        $msg = 'New password and confirm password do not match.';
    } elseif (strlen($new) < 6) {
        $msg = 'Password must be at least 6 characters.';
    } else {
        $stmt = $pdo->prepare("SELECT usrPwd FROM tbluser WHERE usrId = ?");
        $stmt->execute([$_SESSION['userid']]);
        $row = $stmt->fetchObject();
        if ($row && password_verify($current, $row->usrPwd)) {
            $hash = password_hash($new, PASSWORD_BCRYPT);
            $upd  = $pdo->prepare("UPDATE tbluser SET usrPwd = ? WHERE usrId = ?");
            $upd->execute([$hash, $_SESSION['userid']]);
            $msg = 'Password changed successfully.';
        } else {
            $msg = 'Current password is incorrect.';
        }
    }
}
$msgColor = str_contains($msg, 'successfully') ? 'green' : 'red';
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
                        <form id="frmChange_Password" method="post">
                            <table align="center">
                                <tr><td style="color:<?= h($msgColor) ?>"><?= h($msg) ?></td></tr>
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Change Password</legend>
                                            <table>
                                                <tr>
                                                    <td>User Id</td>
                                                    <td><?= h($_SESSION['username'] ?? '') ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Current Password <span style="color:red">*</span></td>
                                                    <td><input type="password" name="txtCurrent_Password"></td>
                                                </tr>
                                                <tr>
                                                    <td>New Password <span style="color:red">*</span></td>
                                                    <td><input type="password" name="txtNew_Password"></td>
                                                </tr>
                                                <tr>
                                                    <td>Confirm Password <span style="color:red">*</span></td>
                                                    <td><input type="password" name="txtConfirm_Password"></td>
                                                </tr>
                                                <tr>
                                                    <td><input type="submit" name="smtUpdate" value="Update"></td>
                                                    <td><input type="button" value="Cancel" onclick="history.back()"></td>
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
