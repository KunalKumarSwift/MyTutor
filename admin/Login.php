<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$msg = '';
if (isset($_POST['smtLogin'])) {
    $userId = $_POST['txtUserId']   ?? '';
    $pwd    = $_POST['txtPassword'] ?? '';

    $stmt = $pdo->prepare("SELECT usrId,usrPwd,usrName,usrType,usrStatus FROM tbluser WHERE usrId=?");
    $stmt->execute([$userId]);
    $row = $stmt->fetchObject();

    if ($row && password_verify($pwd, $row->usrPwd)) {
        if ($row->usrStatus === 'Active') {
            session_regenerate_id(true);
            $_SESSION['userid']   = $row->usrId;
            $_SESSION['username'] = $row->usrName;
            $_SESSION['usertype'] = $row->usrType;
            header('Location: ' . baseurl() . ($row->usrType === 'Admin' ? 'admin/index.php' : 'operator/index.php'));
            exit;
        }
        $msg = 'Your account has been deactivated.';
    } else {
        $msg = 'Invalid User ID or Password.';
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
                        <form id="frmLogin" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Login</legend>
                                            <table>
                                                <tr><td colspan="2" style="color:red"><?= h($msg) ?></td></tr>
                                                <tr>
                                                    <td>User Id</td>
                                                    <td><input type="text" name="txtUserId"></td>
                                                </tr>
                                                <tr>
                                                    <td>Password</td>
                                                    <td><input type="password" name="txtPassword"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2" align="center">
                                                        <input type="submit" name="smtLogin" value="Login">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2" align="center">
                                                        <a href="<?= h(baseurl()) ?>admin/ForgotPassword.php"
                                                           style="color:royalblue">Forgot your password?</a>
                                                    </td>
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
