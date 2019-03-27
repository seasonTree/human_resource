<?php
/**
 * Class analysis
 *
 * doc,docx,mht,html,htm => string or array or html
 *
 * 目前支持，doc，docx，mht，html，htm格式,不能100%解析，存在解析不了的问题
 *
 */
class Analysis {

    private $ext = '';

    public function __call($name, $arguments){

        return false;
        
    }
  
    /*
        参数1，地址
        参数2，判断返回内容的类型/array数组,string字符串
    */
    public function getContent($path,$option = 'array'){
        //分析所读文件返回结果
        $this->ext = strtolower(substr(strrchr($path,'.'),1));//获取后缀名
        $method = 'get'.ucfirst($this->ext);

        return $this->$method($path,$option);

    }

    public function getMht($path,$option = 'array'){
        //解析Mht
        //解析mht格式,原理：mth文件其实就是由多段base64加密的字符串拼接而成
        /*
            参数1，地址

        */
        $content = file_get_contents($path);//打开文件
        $arr = preg_replace("/\n|\r\n/","\n",$content);//匹配
        $arr = explode("\n", $arr);//分解
        $temp = '';//创建临时变量
        $content = '';//最终输出结果
        foreach ($arr as $k => $v) {
            $temp.= $v;//拼接
            if ($v == '') {
                $res = base64_decode($temp);//解码
                if ($res) {
                    $content.= $res;
                }
                $temp = '';//清空
            }
        }
  
        $content = explode('</tr>', $content);//分组
        // $data = if($option == 'string')[];
        $temp = '';
        $data = '';
        $count = count($content)-1;
        $title = "</tr>";
        foreach ($content as $a => $b) {

            // $temp = preg_replace("/(\s|\&nbsp\;|\&emsp\;|\&#x20\;|\xc2\xa0)/", "", strip_tags($b));
            if ($option == 'html') {
                if ($a == $count) {
                    $title = '';
                }
                $temp = $b.$title;
            }
            else{
                $temp = preg_replace("/(\s|\&nbsp\;|\&emsp\;|\&#x20\;|\xc2\xa0)/", "", strip_tags($b));  
            }
            if ($temp == '') {
                continue;
            }
            if ($option == 'html') {
                $data.= $this->getConvert($temp);
            }
            if ($option == 'string') {
                $data.=  $this->getConvert($temp)."\n";
            }
            if ($option == 'array') {
                $data[] = $this->getConvert($temp);//转码,@抑制错误
            }
            
            
        }
        return $data;
    }

    public function getHtml($path,$option = 'array'){
        //解析HTML
        $content = file_get_contents($path);//打开文件
        
        // $content = preg_replace("/(\s|\&nbsp\;|　|\xc2\xa0)/", "", strip_tags($content,'<tr>'));  

        $content = explode('</tr>',$content);
        $data = '';
        $count = count($content)-1;
        $title = "</tr>";
        foreach ($content as $k => $v) {
            
            if ($option == 'html') {
                $temp = $v;
            }
            else{
                $temp = preg_replace("/(\s|\&nbsp\;|　|\xc2\xa0)/", "", strip_tags($v));  
            }
            
            if ($temp == '') {
                continue;
            }
            if ($option == 'html') {
                if ($k == $count) {
                    $title = '';
                }
                $data.= $this->getConvert($v).$title;
            }
            if ($option == 'string') {
                $data.=  $this->getConvert($temp)."\n";
            }
            if ($option == 'array') {
                $data[] = $this->getConvert($temp);//转码,@抑制错误
            }

        }
        return $data;

    }

    public function getHtm($path,$option = 'array'){
        //解析htm
        // $content = $this->getConvert(file_get_contents($path));
        // dump($content);exit;
        return $this->getHtml($path,$option);
    }

    public function getDoc($path,$option = 'array'){
        //解析doc
        $content = file_get_contents($path);//打开文件

        // $content = preg_replace("/(\s|\&nbsp\;|　|\xc2\xa0)/", "", strip_tags($content,'<tr>'));  
        
        $content = explode('</tr>',$content);
        // $data = [];
        $count = count($content)-1;
        $title = "</tr>";
        $data = '';
        foreach ($content as $k => $v) {
            
            if ($option == 'html') {
                $temp = $v;
            }
            else{
                $temp = preg_replace("/(\s|\&nbsp\;|　|\xc2\xa0)/", "", strip_tags($v));  
            }

            if ($temp == '') {
                continue;
            }
            if ($option == 'html') {
                if ($count == $k) {
                    $title = '';
                }
                $data.= $this->getConvert($temp).$title;
            }
            if ($option == 'string') {
                $data.=  $this->getConvert($temp)."\n";
            }
            if ($option == 'array') {
                $data[] = $this->getConvert($temp);//转码
            }

        }
        return $data;

    }

    public function getDocx($path,$option = 'array'){
        //解析docx
        $docx = new \ZipArchive();
        $ret = $docx->open($path);
        $document = $docx->getFromName('word/document.xml');
        $content = explode("</w:tcPr>", $document);
        $data = '';
        $temp = '';
        $count = count($content)-1;
        $title = "</w:tcPr>";
            foreach ($content as $k => $v) {
                
                if ($option == 'html'){
                    if ($k == $count ) {
                        $title = '';
                    }
                    $temp = $this->getConvert($v).$title;
                }
                else{
                    $content = strip_tags($v);
                    $temp = preg_replace("/(\s|\&nbsp\;| |\xc2\xa0)/", "",$content); 
                }

                if ($temp == '') {
                    continue;
                }

                if ($option == 'string') {
                    
                    $data.= $temp."\n";
                }
                if ($option == 'array') {
                    $data[] = $temp;
                }
                if ($option == 'html') {
                    $data.= $temp;
                }
                $temp = '';
                
            }
        return $data;
        
    }

    public function getConvert($str){
        //转码方法1
        $encode = mb_detect_encoding($str, array("ASCII",'UTF-8',"GB2312","GBK",'BIG5'));
        if ($encode != false) {
            
            $str = mb_convert_encoding($str, 'UTF-8',$encode);

        }
        return $str;
    }

    public function getSafeStr($str){
        //把字符编码转化成utf-8
        $s1 = iconv('gbk','utf-8//IGNORE',$str);
        $s0 = iconv('utf-8','gbk//IGNORE',$s1);
        if($s0 == $str){
            return $s1;
        }else{
            return $str;
        }
    }

    /***************************封装curl*******************************/

    public function curlGet($url, array $params = array(), $timeout = 5){
        //curl get
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        $file_contents = curl_exec($ch);
        curl_close($ch);
        return $file_contents;
    }

    public function curlPost($url, array $params = array(), $timeout = 5){
        //curl post
        $ch = curl_init();//初始化
        curl_setopt($ch, CURLOPT_URL, $url);//抓取指定网页
        curl_setopt($ch, CURLOPT_HEADER, 0);//设置header
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        $data = curl_exec($ch);//运行curl
        curl_close($ch);
        $data = json_decode($data,1);//转化成数组输出
        return ($data);
    }
     
    public function curlGetHttps($url){
        //curl https
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.1 Safari/537.11');
        $res = curl_exec($ch);
        $rescode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $res;
    }

    /***************************end********************************/


}