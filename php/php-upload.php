<?php
 header("Content-type: text/html; charset=utf-8");

/*
 * $_FILES["file"]["error"]
 * 0: 文件上传成功<br/>
 * 1：超过了文件大小，在php.ini文件中设置<br/>
 * 2：超过了文件的大小MAX_FILE_SIZE选项指定的值<br/>
 * 3：文件只有部分被上传<br/>
 * 4：没有文件被上传<br/>
 * 5：上传文件大小为0
 */


    switch ($_FILES["file"]["error"])
    {
    case 0:
        $result = "文件上传成功";
        break;
    case 1:
        $result = "超过了文件大小，在php.ini文件中设置";
        break;
    case 2:
        $result = "超过了文件的大小MAX_FILE_SIZE选项指定的值";
        break;
    case 3:
        $result = "文件只有部分被上传";
        break;
    case 4:
        $result = "没有文件被上传";
        break;
    default:
        $result = "上传文件大小为0";
    }

    echo "==============================================" . "<br/>";
    echo "上传文件名称: " . $_FILES["file"]["name"] . "<br />";
    echo "上传文件类型: " . $_FILES["file"]["type"] . "<br />";
    echo "上传文件大小: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
    echo "上传后系统返回的值: " . $result . "<br />";
    echo "上传文件的临时存放路径: " . $_FILES["file"]["tmp_name"] . "<br />";

    move_uploaded_file($_FILES["file"]["tmp_name"],"/data/home/hyu3159700001/htdocs/shili/json/" . $_FILES["file"]["name"]);

    echo "上传路径: " . "htdocs/shili/json/" . $_FILES["file"]["name"];
?>