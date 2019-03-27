<?php
namespace app\index\controller;

use think\facade\Cookie;
use think\facade\Log;
use think\facade\Request;
use think\facade\Session;
use think\facade\Env;
use app\index\model\User as UserModel;
class User
{

    public function getUserInfo(){
        //用户信息
        $user_info = Session::get('user_info')?Session::get('user_info'):[];
        return json(['code' => 0,'msg' => '获取成功','data' => $user_info]);
    }

    public function logOut(){
        //登出
        session(null);
        return json(['code' => 0,'msg' => '退出成功','data' => []]);
    }

    public function changePassword(){
        //修改密码
        $parm = input('post.');
        if ($parm['oldPass'] == '') {
          return json(['msg' => '旧密码不能为空','code' => 2,'data' => []]);
        }
        if ($parm['newPass'] == '') {
          return json(['msg' => '新密码不能为空','code' => 3,'data' => []]);
        }
        if ($parm['newPass'] != $parm['newPassRe']) {
          return json(['msg' => '新密码不一致','code' => 4,'data' => []]);
        }
        $user = new UserModel();
        $find = $user->getOne(['id' => Session::get('user_info')['id']]);
        if (hash('sha256',$parm['oldPass']) != $find['passwd']) {
          return json(['msg' => '旧密码错误','code' => 5,'data' => []]);
        }
        $data['id'] = Session::get('user_info')['id'];
        $data['passwd'] = hash('sha256',$parm['newPass']);
        $res = $user->edit($data);
        if ($res) {
          return json(['msg' => '修改成功','code' => 0,'data' => []]);
        }
        else{
          return json(['msg' => '修改失败','code' => 1,'data' => []]);
        }
    }
    public function lst(){
      $data = model('User')->lst();
      return json(['code' => 0,'msg' => '获取数据成功','data' => $data]);
    }
    public function lstPage(){
        $data = input('get.');
        $where = [];
        $name = isset($data['name'])?trim($data['name']):'';
        
        if($name != '') {
            $where['uname'] = $name;
        }

        $data = model('User')->lstPage($data['pageIndex'],$data['pageSize'], $where);
        return json(['code' => 0,'msg' => '获取数据成功','data' => $data]);

    }
    public function getOne(){
        $id = input('post.id');
        $data = model('User')->getOne(['id'=>$id]);
        unset($data['passwd']);
        return json(['data'=>$data,'code'=>0,'msg'=>'获取某条数据成功']);
    }
    public function edit(){
        $data =input('post.');

        if(!isset($data['id'])){
            return json(['msg' => '参数错误.','code' => 500]);
        }

        $data['mfy_user'] = Session::get('user_info')['uname'];
        unset($data['mfy_time']);
        $id=model('User')->edit($data);
        if($id){
            $data = model('User')->getOne(['id'=>$data['id']]);
            unset($data['passwd']);
            return json(['data'=>$data,'code'=>0,'msg'=>'修改成功']);
        }
    }
    public function add(){
        $data = input('post.');

        if (empty($data)) {
            return json(['msg' => '没有数据， 新增用户失败.','code' => 500]);
        }

        if ($data['passwd'] != $data['repasswd']){
            return json(['msg' => '两次输入的密码不一致， 新增用户失败.','code' => 500]);
        }
        
        $udata = model('User')->getOne(['uname'=>$data['uname']]);

        if($udata){
            return json(['msg' => '存在重复的用户名， 新增用户失败.','code' => 500]);
        }

        if(!checkUser($data['uname'])){
            return json(['msg' => '用户名长度为2到16字符， 新增用户失败.','code' => 500]);
        }

        if(!checkPassword($data['passwd'])){
            return json(['msg' => '密码长度最小6个字符， 新增用户失败.','code' => 500]);
        }


        $data['ct_user'] = Session::get('user_info')['uname'];
        $data['passwd'] = hash('sha256',$data['passwd']);
        $id=model('User')->add($data);
        
        if($id){
            $data = model('User')->getOne(['id'=>$id]);
            unset($data['passwd']);
            return json(['data'=>$data,'code'=>0,'msg'=>'新增成功']);
        }
    }
    public function del(){
        $id = input('post.id');
        if(model('User')->where(['id'=>$id])->delete()){
            return json(['data'=>null,'code'=>0,'msg'=>'删除成功']);
        }
    }
    public function changeStatus(){
        $data = input('post.');

        $data['mfy_user'] = Session::get('user_info')['uname'];
        unset($data['mfy_time']);

        if(model('User')->edit($data)){
            
            $data = model('User')->getOne(['id'=>$data['id']]);
            unset($data['passwd']);
        }

        return json(['data'=>$data,'code'=>0,'msg'=>'修改状态成功']);
    }
    public function changeUserPasswd(){
        $data = input('post.');
        $data['passwd'] = hash('sha256',$data['passwd']);

        unset($data['mfy_time']);
        $data['mfy_user'] = Session::get('user_info')['uname'];

        if(model('User')->edit($data)){

            $data = model('User')->getOne(['id'=>$data['id']]);
            unset($data['passwd']);
        }            
        return json(['data'=>$data,'code'=>0,'msg'=>'修改状态成功']);
    }
    /**
     * 根据user id 获取权限
     * 
     */
    public function getUserPermission(){
       $id =  Session::get('user_info.id');
        
       $data = model('User')->getPriById($id);
       
       $auth = Session::get('auth');
       if (!$auth || count($data)!= count($auth)) {
          $auth = [];
          foreach ($data as $k => $v){
             $auth[] = $v['api'];
          }
          Session::set('auth',$auth);
       }

       return json(['data'=>$data,'code'=>0,'msg'=>'获取权限成功']);
    }

    public function updateAvatar(){
      //修改用户头像
      $input = input('post.avatar');
      $res = $this->runUpdateAvatar($input);
      if ($res) {
        return json(['code' => 0,'msg' => '修改成功','data' => $res]);
      }
      else{
        return json(['code' => 1,'msg' => '服务器异常','data' => []]);
      }
    }

    public function updateAvatarByAdmin(){
      //管理员修改用户头像
      $uid = input('post.id');
      $img = input('post.avatar');
      $res = $this->runUpdateAvatar($img,$uid);
      if ($res) {
        return json(['code' => 0,'msg' => '修改成功','data' => $res]);
      }
      else{
        return json(['code' => 1,'msg' => '服务器异常','data' => []]);
      }

    }

    public function runUpdateAvatar($img_content,$uid = ''){
      //修改用户头像
      $input = $img_content;
      $path = dirname(Env::get('ROOT_PATH')).'/client/dist/uploads/avatar/';
      if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $input, $result)){
        $type = $result[2];
        $id = $uid == ''?Session::get('user_info')['id']:$uid;
        $img = $path.$id.'.'.$type;
        $res = file_put_contents($img, base64_decode(str_replace($result[1], '', $input)));
        if ($res) {
          $user = new UserModel();
          $res = $user->edit(['id' => $id,'avatar' => '/uploads/avatar/'.$id.'.'.$type]);
          if ($res) {
            return '/uploads/avatar/'.$id.'.'.$type;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
      }else{
          return false;
      }

    }
}
