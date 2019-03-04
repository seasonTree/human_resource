<template>
    <div class="not-found">
        <div class="not-found-image"></div>
        <el-button
            type="primary"
            class="home-btn"
            @click="home"
        >Return Home Page</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        home() {
            this.$router.replace("/dashboard");
        }
    }
};
</script>
<style lang="less" scoped>
.not-found {
    .not-found-image {
        width: 500px;
        height: 260px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: url("../../image/404.gif");
        background-size: 100% 100%;
    }

    position: absolute;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
}

.home-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}
</style>