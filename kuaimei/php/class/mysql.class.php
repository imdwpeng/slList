<?php
    include "common/config.php";
    header("Content-type: application/json; charset=utf-8");
    header('Access-Control-Allow-Origin:*');

    class Mysql{
        public $db;

        //构造函数
        public function __construct(){
            $host = isset($GLOBALS['config']['host'])?$GLOBALS['config']['host'] : 'localhost';
            $user = isset($GLOBALS['config']['user'])? $GLOBALS['config']['user'] : 'root';
            $password = isset($GLOBALS['config']['password'])? $GLOBALS['config']['password'] : '';
            $dbname = isset($GLOBALS['config']['dbname'])? $GLOBALS['config']['dbname'] : '';
            $port = isset($GLOBALS['config']['port'])? $GLOBALS['config']['port'] : '3306';
            $charset = isset($GLOBALS['config']['charset'])? $GLOBALS['config']['charset'] : 'utf8';
            $this->db = mysqli_connect($host, $user, $password, $dbname) or die('数据库连接错误');
            mysqli_select_db($this->db, $dbname) or die('数据库选择错误');
            mysqli_set_charset($this->db,"utf8");
        }
        
        /**
         * 获取查询条件
         * @param $like string 模糊查询字段
         */
        private function getWhere($like){
            $params=array();
            $sql='';

            foreach ($_GET as $key=>$value){
                $param;
                if($key == $like){
                    $param = $key.' LIKE "%'.$value.'%"';
                }else if(is_array($value)) {
                    $param = $key.' between "'.$value[0].'" and "'.$value[1].'"';
                }else{
                    $param = $key.'="'.$value.'"';
                }
                array_push($params,$param);
            }
            
            if(count($params)>0){
                for($i=0; $i<=count($params)-1; $i++){
                    if($i == 0){
                    $sql .= ' WHERE '.$params[$i];
                    }else{
                    $sql .= ' AND '.$params[$i];
                    }
                }
            }

            return $sql;
        }

        /**
         * 获取创建数据
         */
        private function getNewParams(){
            $params = array();

            $postStr = file_get_contents("php://input") or '';
            // [{id:1,str1:'a1',str2:'b1',str3:'c1'},{id:1,str1:'a1',str2:'b1',str3:'c1'}]
            $post = json_decode($postStr,true);

            // $key->0,$value->{id:1,str1:'a1',str2:'b1',str3:'c1'}
            foreach($post as $key=>$value){
                $paramAttr = array();
                $keyAttr = array();
                $valueAttr = array();
                // $k->id,$v->1
                foreach($value as $k=>$v){
                    // [id,str1,str2,str3]
                    array_push($keyAttr, $k);
                    // [1,'a1','b1','c1']
                    array_push($valueAttr, '"'.$v.'"');
                }
                
                // (1,'a1','b1','c1')
                $param = '('.implode(',', $valueAttr).')';
                // (id,str1,str2,str3) VALUES (1,'a1','b1','c1')
                $sql = $param;

                if (count($params) === 0) {
                    // (id,str1,str2,str3)
                    $keys = '('.implode(',', $keyAttr).')';
                    array_push($params, $keys);
                }

                array_push($params, $sql);
            }

            return $params;
        }

        /**
         * 获取更新数据
         */
        private function getParams(){
            $keyAttr = array();
            $valueAttr = array();

            $postStr = file_get_contents("php://input") or '';
            // [{id:1,str1:'a1',str2:'b1',str3:'c1'},{id:1,str1:'a1',str2:'b1',str3:'c1'}]
            $post = json_decode($postStr,true);

            // $key->0,$value->{id:1,str1:'a1',str2:'b1',str3:'c1'}
            foreach($post as $key=>$value){
                $paramAttr = array();
                // $k->id,$v->1
                foreach($value as $k=>$v){
                    if($key == 0){
                        // [id,str1,str2,str3]
                        array_push($keyAttr, $k);
                    }
                    // [1,'a1','b1','c1']
                    array_push($paramAttr, '"'.$v.'"');
                }

                // (1,'a1','b1','c1')
                $param = '('.implode(',', $paramAttr).')';
                // [(1,'a1','b1','c1'),(2,'a2','b2','c2')]
                array_push($valueAttr, $param);
            }

            // (id,str1,str2,str3)
            $keys = '('.implode(',', $keyAttr).')';
            // (1,'a1','b1','c1'),(2,'a2','b2','c2')
            $values = implode(',', $valueAttr);

            // (id,str1,str2,str3) values (1,'a1','b1','c1'),(2,'a2','b2','c2')
            $params = $keys.' values '.$values;

            return $params;
        }

        /**
         * 获取删除id
         */
        public function getDeleteId(){
            $deleteId = $deleteId = $_GET['id'];

            return $deleteId;
        }

        /**
         * 查询
         * @param $tbName string 表名
         * @param $like string 模糊查询字段
         * @param $field string 查询列，默认 '*':全部
         * @return array 返回数组
         */
        public function Query($tbName, $like='', $field='*'){
            $where = $this->getWhere($like);
            $sql = 'SELECT '.$field.' FROM '.$tbName.$where;

            $data = array();
            $db = $this->db;
            $result = mysqli_query($db, $sql);
            if (mysqli_num_rows($result) > 0) {
                // 输出数据
                while($row = mysqli_fetch_assoc($result)) {
                    $data[] = $row;
                }
            } 
            
            return $data;
        }

        /**
         * php自身查询
         * @param $tbName string 表名
         * @param $where string 查询条件
         * @param $field string 查询列，默认 '*':全部
         */
        public function doQuery($tbName, $where, $field='*'){
            $sql = 'SELECT '.$field.' FROM '.$tbName;
            if($where){
                $sql .= ' WHERE '.$where;
            }

            $data = array();
            $db = $this->db;
            $result = mysqli_query($db, $sql);
            if (mysqli_num_rows($result) > 0) {
                // 输出数据
                while($row = mysqli_fetch_assoc($result)) {
                    $data[] = $row;
                }
            } 
            
            return $data;
        }

        /**
         * 创建
         * @param $tbName string 表名
         */
        public function Post($tbName){
            $params = $this->getNewParams();
            $keys=array_shift($params);
            $sql = 'INSERT INTO '.$tbName.$keys .' VALUES ';

            foreach($params as $key=>$value){
                $sql .= $value.',';
            }

            $sql = substr($sql, 0,mb_strlen($sql)-1);

            $db = $this->db;
            $result = mysqli_query($db, $sql);

            return $result;
        }

        /**
         * 更新数据
         * @param $tbName string 表名
         * @return boolean 返回1/0
         */
        public function Put($tbName) {
            $params = $this->getParams();
            $sql = 'replace into '.$tbName.' '.$params;
            $db = $this->db;
            $result = mysqli_query($db, $sql);

            return $result;
        }

        /**
         * 删除
         * @param $tbName 表名
         * @return boolean 返回1/0
         */
        public function Delete($tbName) {
            $id = $this->getDeleteId();
            $sql = 'DELETE FROM '.$tbName.' WHERE id="'.$id.'"';

            $db = $this->db;
            $result = mysqli_query($db, $sql);

            return $result;
        }
    }

?>