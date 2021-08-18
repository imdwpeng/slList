<?php
/*
 * @Author: DWP
 * @Date: 2021-08-11 15:38:40
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-17 10:57:41
 */
  header("Content-type: application/json; charset=utf-8");

  include("class/mysql.class.php");
  include('common/utils.php');

  $code;
  $msg;
  $result;

  $conn = new Mysql();
  $utils = new Utils();

  // 请求类型
  $requestType = $_SERVER['REQUEST_METHOD'];
  // 查询
  if($requestType === 'GET'){
    $data = $conn->Query('cow_data');
    $result = count($data) >= 0;
  } else if($requestType === 'PUT') {
    // 修改
    $result = $conn->Put('cow_data');
  } else if($requestType === 'DELETE'){
    // 删除
    $result = $conn->Delete('cow_data');
  } else if($requestType === 'POST'){
    // 新增
    $result = $conn->Post('cow_data');
  }

  if($result){
    $code = 200;
    $msg = '成功';
  }else{
    $code = 404;
    $msg = '暂无数据';
  }
  
  $json = $utils->json($code, $msg, $data);

  echo $json;
  
  mysqli_close($conn->db);
?>