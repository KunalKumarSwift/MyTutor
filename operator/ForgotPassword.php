<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg    = '';
$status = 'recover';
$newPwd = '';

if (isset($_POST['smtRecover'])) {
    $userId = trim($_POST['txtUserId'] ?? '');
    $email  = trim($_POST['txtEmail']  ?? '');

    $stmt = $pdo->prepare("SELECT usrId FROM tbluser WHERE usrId=? AND usrEmail=?");
    $stmt->execute([$userId, $email]);
    if ($stmt->fetchObject()) {
        $newPwd = bin2hex(random_bytes(6));
        $hash   = password_hash($newPwd, PASSWORD_BCRYPT);
        $upd    = $pdo->prepare("UPDATE tbluser SET usrPwd=? WHERE usrId=?");
        $upd->execute([$hash, $userId]);
        $status = 'success';
    } else {
        $msg = 'Invalid User ID or Email.';
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
                        <form id="frmForgot_Password" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <?php if ($status === 'recover'): ?>
                                            <fieldset>
                                                <legend>Forgot Password</legend>
                                                <table>
                                                    <tr><td colspan="2" style="color:red"><?= h($msg) ?></td></tr>
                                                    <tr><td colspan="2">Enter your User ID &amp; Email to reset your password.</td></tr>
                                                    <tr>
                                                        <td>User Id <span style="color:red">*</span></td>
                                                        <td><input type="text" name="txtUserId"></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Email <span style="color:red">*</span></td>
                                                        <td><input type="email" name="txtEmail"></td>
                                                    </tr>
                                                    <tr>
                                                        <td><input type="submit" name="smtRecover" value="Recover"></td>
                                                        <td><input type="button" value="Cancel" onclick="history.back()"></td>
                                                    </tr>
                                                </table>
                                            </fieldset>
                                        <?php else: ?>
                                            <fieldset>
                                                <legend>Password Reset</legend>
                                                <table>
                                                    <tr>
                                                        <td>Your new temporary password is: <strong><?= h($newPwd) ?></strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <a href="<?= h(baseurl()) ?>guest/Login.php">Click here to login</a>
                                                            and change your password immediately.
                                                        </td>
                                                    </tr>
                                                </table>
                                            </fieldset>
                                        <?php endif; ?>
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
