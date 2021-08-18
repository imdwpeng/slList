<?php
  class Utils{
    /**
      * 转json输出
      * @access private
      * @param $code int 响应状态值
      * @param $meg string 响应结果
      * @param $data object 返回值
      */
    public function json($code, $msg, $data=array()){
      $result=array(  
        'code'=>$code,  
        'msg'=>$msg,  
        'data'=>$data   
      );  
      //输出json  
      return json_encode($result);  
    }
  }
?>