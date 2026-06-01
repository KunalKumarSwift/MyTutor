<?php include "../include/header.php"; ?>
<?php include "../include/topmenu.php"; ?>
<?php
$search = $_POST['txtCategory'] ?? '';
$stmt = $pdo->prepare(
    "SELECT categoryId,categoryTitle,categoryDesc,categoryStatus FROM tblcategory
     WHERE categoryTitle LIKE ?"
);
$stmt->execute(['%' . $search . '%']);
$categories = $stmt->fetchAll();
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
                        <form id="frmManage_Category" method="post">
                            <table>
                                <tr>
                                    <td>
                                        <fieldset>
                                            <legend>Manage Category</legend>
                                            <table>
                                                <tr>
                                                    <td><input type="button" value="Add New" onclick="window.location.href='AddCategory.php'"></td>
                                                    <td>Category</td>
                                                    <td><input type="text" name="txtCategory" value="<?= h($search) ?>"></td>
                                                    <td><input type="submit" name="smtSearch" value="Search"></td>
                                                </tr>
                                            </table>
                                            <table border="1" align="center">
                                                <tr>
                                                    <td>Category</td>
                                                    <td>Description</td>
                                                    <td>Status</td>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                                </tr>
                                                <?php foreach ($categories as $cat): ?>
                                                    <tr>
                                                        <td><?= h($cat->categoryTitle) ?></td>
                                                        <td><?= h($cat->categoryDesc) ?></td>
                                                        <td><?= h($cat->categoryStatus) ?></td>
                                                        <td><a href="EditCategory.php?cid=<?= (int)$cat->categoryId ?>">EDIT</a></td>
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
