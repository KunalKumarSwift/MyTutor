<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php include "checksession.php"; ?>
<?php
if (isset($_GET['uid'])) {
    $stmt = $pdo->prepare(
        "UPDATE tbluser
         SET usrStatus = CASE WHEN usrStatus='Active' THEN 'Inactive' ELSE 'Active' END
         WHERE usrId=?"
    );
    $stmt->execute([$_GET['uid']]);
    header('Location: ManageUser.php');
    exit;
}

$search = $_POST['txtSearch'] ?? '';
$stmt = $pdo->prepare(
    "SELECT usrId,usrName,usrDOB,usrGender,usrEmail,usrMobile,usrStatus
     FROM tbluser WHERE usrName LIKE ?"
);
$stmt->execute(['%' . $search . '%']);
$users = $stmt->fetchAll();
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
                        <form id="frmManage_Users" method="post">
                            <table align="center">
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Manage Users</legend>
                                            <table>
                                                <tr>
                                                    <td><input type="button" value="Add New" onclick="window.location.href='AddUser.php'"></td>
                                                    <td>Name</td>
                                                    <td><input type="text" name="txtSearch" value="<?= h($search) ?>"></td>
                                                    <td><input type="submit" name="btnSearch" value="Search"></td>
                                                </tr>
                                            </table>
                                            <table border="1">
                                                <tr>
                                                    <td>User Id</td>
                                                    <td>Name</td>
                                                    <td>DOB</td>
                                                    <td>Gender</td>
                                                    <td>Email</td>
                                                    <td>Mobile</td>
                                                    <td>Status</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <?php foreach ($users as $u): ?>
                                                    <tr>
                                                        <td><?= h($u->usrId) ?></td>
                                                        <td><?= h($u->usrName) ?></td>
                                                        <td><?= h($u->usrDOB) ?></td>
                                                        <td><?= h($u->usrGender) ?></td>
                                                        <td><?= h($u->usrEmail) ?></td>
                                                        <td><?= h($u->usrMobile) ?></td>
                                                        <td>
                                                            <?= h($u->usrStatus) ?>&nbsp;&nbsp;
                                                            <a href="ManageUser.php?uid=<?= urlencode($u->usrId) ?>">CHANGE</a>
                                                        </td>
                                                        <td><a href="<?= h(baseurl()) ?>admin/EditUser.php?mid=<?= urlencode($u->usrId) ?>">[EDIT]</a></td>
                                                    </tr>
                                                <?php endforeach; ?>
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
