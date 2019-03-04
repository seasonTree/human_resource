<template>
    <el-dialog
        title="Change password"
        :visible.sync="show"
        :before-close="closeDialog"
        class="custom-dialog"
        :close-on-click-modal="false"
        v-dialog-drag
    >
        <el-form
            :model="changePwd"
            ref="changePwdForm"
            label-width="100px"
            :rules="rules"
        >
            <el-form-item
                label="Old password"
                prop="oldPass"
            >
                <el-input
                    v-model="changePwd.oldPass"
                    type="password"
                    autocomplete="off"
                    placeholder="Please enter your password"
                ></el-input>
            </el-form-item>
            <el-form-item
                label="New password"
                prop="newPass"
            >
                <el-input
                    v-model="changePwd.newPass"
                    type="password"
                    autocomplete="off"
                    placeholder="Please enter a new password"
                ></el-input>
            </el-form-item>
            <el-form-item
                label="Confirm password"
                prop="newPassRe"
            >
                <el-input
                    v-model="changePwd.newPassRe"
                    type="password"
                    autocomplete="off"
                    placeholder="Please enter your new password again"
                ></el-input>
            </el-form-item>
        </el-form>
        <div
            slot="footer"
            class="dialog-footer"
        >
            <el-button @click="closeDialog">Close</el-button>
            <el-button
                :loading="commitLoading"
                type="primary"
                @click="changePassword"
            >Update</el-button>
        </div>
    </el-dialog>
</template>

<script>
let passRules = [
    {
        required: true,
        message: "Please fill in the required password",
        trigger: "blur"
    },
    {
        min: 6,
        // max: 16,
        message: "The length is at least 6 characters",
        trigger: "blur"
    }
];

import DialogForm from "../base/DialogForm";
export default {
    name: "ChangePassword",

    mixins: [DialogForm],

    data() {
        return {
            changePwd: {
                oldPass: "",
                newPass: "",
                newPassRe: ""
            },

            rules: {
                oldPass: passRules,
                newPass: passRules,
                newPassRe: passRules.concat({
                    validator: (rule, value, callback) => {
                        let that = this;

                        if (that.changePwd.newPass !== value) {
                            callback(
                                new Error("The passwords do not match, Please re-enter them")
                            );
                        } else {
                            callback();
                        }
                    }
                })
            },

            commitLoading: false
        };
    },

    methods: {
        changePassword() {
            let that = this;

            that.$refs["changePwdForm"].validate(valid => {
                if (valid) {
                    that.commitLoading = true;

                    that.$api.user
                        .changePassword(that.changePwd)
                        .then(res => {
                            if (res.code == 200) {
                                that.$message({
                                    message: "Modify the success.",
                                    type: "success",
                                    duration: 800
                                });

                                that.closeDialog();
                            } else {
                                that.$message.error(res.message);
                            }

                            that.commitLoading = false;
                        })
                        .catch(res => {
                            that.$message.error("The modification failed. Please try again.");
                            that.commitLoading = false;
                        });
                }
            });
        },

        afterClose() {
            this.$refs["changePwdForm"].resetFields();
        }
    }
};
</script>
<style lang="less" scoped>
</style>