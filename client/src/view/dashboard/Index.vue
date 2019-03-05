<template>
    <div class="dashboard">
        欢迎 {{userInfo.userid}} .

    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    data() {
        return {
        };
    },
    created() {
        let that = this;
        // that.getData();
    },

    computed: {
        // ...mapGetters(["userInfo"])
    },

    methods: {
        getData() {
            let that = this;
            that.$api.dashboard
                .get()
                .then(res => {
                    if (res.code == 200) {
                    } else {
                        that.$message.error(
                            res.message || "获取数据失败，请刷新后重试."
                        );
                    }
                })
                .catch(res => {
                    that.$message.error("获取数据失败，请刷新后重试.");
                });
        }
    }
};
</script>
<style lang="less" scoped>
.dashboard {
    height: 100%;
    > div {
        height: 100%;
    }
}
</style>