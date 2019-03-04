<template>
    <div class="dashboard">
        Welcome {{userInfo.userid}} .

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
                            res.message || "Failed to get the data, please refresh and try again."
                        );
                    }
                })
                .catch(res => {
                    that.$message.error("Failed to get the data, please refresh and try again.");
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