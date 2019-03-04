<template>
    <div class="login-container">

        <el-form ref="form" :model="form" class="login-form">
            <div class="login-title">ECommerce</div>
            <el-input v-model.trim="form.username" placeholder="Please enter Username" auto-complete="off"></el-input>
            <el-input @keyup.native.enter="submitHandler" v-model.trim="form.password" type="password" placeholder="Please enter your password" autocomplete="off"></el-input>
            <el-button type="primary" :loading="loading" @click="submitHandler">Login</el-button>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "login",

    data() {
        return {
            form: {
                username: "",
                password: ""
            },

            loading: false
        };
    },

    methods: {
        submitHandler() {
            let that = this;

            if (!that.form.username) {
                this.$message.error("Please enter Username.");
                return;
            }

            if (!that.form.password) {
                this.$message.error("Please enter password.");
                return;
            }

            that.loading = true;

            that.$api.user
                .login(that.form)
                .then(res => {
                    if (res.code == 200) {
                        this.$message({
                            message: "Login successful",
                            type: "success",
                            duration: 800
                        });

                        that.$store.commit("setUserInfo", res.data);

                        setTimeout(() => {
                            let redirect = decodeURIComponent(
                                that.$route.query.redirect || "/dashboard"
                            );

                            that.$router.push({
                                //你需要接受路由的参数再跳转
                                path: redirect
                            });

                        }, 1200);

                    } else {
                        that.$message.error(res.message || "User or password error. Please try again.");
                        that.loading = false;
                    }
                })
                .catch(res => {
                    that.$message.error("User or password error. Please try again.");
                    that.loading = false;
                });
        }
    }
};
</script>
<style lang='less'>
// @color: #12afe3;
@color: #7266ba;
.login-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: @color;
    // 暂时取消背景
    // background-image: url(../image/login_bg.jpg);
    background-size: 100% 100%;
    
    .login-form {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 35px 15px;
        background-color: white;
        border: 1px solid #d2cece;
        border-radius: 6px;
        max-width: 350px;

        input,
        div {
              margin-bottom: 10px;
        }

        button {
            width: 100%;
        }

        .login-title {
            text-align: center;
            font-size: 1.2em;
        }
    }
}
</style>