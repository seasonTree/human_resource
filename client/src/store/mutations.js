export default {
    setUserInfo(state, value) {

        //如果没有头像的就给个默认的头像
        value.avatar = value.avatar? value.avatar + '?d=' + Date.now() : '/image/user_image.jpg';
        state.user = value;
    },

    clearUserInfo(state, value) {
        state.user = null;
    },

    setMenu(state, value) {
        state.menu = value;
    },

    //设置功能权限
    setActions(state, value) {
        state.btn_act = value;
    },

    updateAvatar(state, value) {
        //处理缓存
        state.user.avatar = value + '?d=' + Date.now();
    },
}