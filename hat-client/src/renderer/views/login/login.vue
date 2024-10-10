<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import request from '../../../utils/request.js'
const username = ref('')
const password = ref('')
// router钩子，返回路由器实例
const router = useRouter()
if (localStorage.getItem('token')) {
    router.push('/home')
}

// 登录
const onLogin = () => {
    if (!username.value || !password.value) {
        ElMessageBox.alert('请输入账号密码', '提示', {
            confirmButtonText: 'OK'
        })
        return
    }
    request
        .postForm('/login/verify', { username: username.value, password: password.value })
        .then((res) => {
            if (res.status === 1) {
                localStorage.setItem('token', res.token)
                router.push('/home')
            } else {
                ElMessageBox.alert(res.msg, '登录失败', {
                    confirmButtonText: 'OK'
                })
            }
        })
}
</script>

<template>
    <div class="container">
        <div class="left-item">
            <img src="./left.png" class="logo" />
        </div>
        <div class="right-item">
            <img src="./logo.png" class="logo" />
            <div class="ipt-con">
                <el-input v-model="username" placeholder="账号" />
            </div>
            <div class="ipt-con">
                <el-input v-model="password" type="password" placeholder="密码" show-password />
            </div>
            <div class="ipt-con">
                <el-button type="primary" style="width: 100%" @click="onLogin">登录</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="stylus">
.container
    display : flex
    height 100vh
    .left-item
        width : 380px
        height: 100%
        background: #7adbcb
        order: 0
        overflow: hidden;
        img
            width: 100%;
            height: 100%;
            object-fit: cover;
    .right-item
        order: 1
        width:  calc(100% - 380px);
        background: #7adbcb
        .logo
            display: block
            margin: 50px auto 20px
            height: 128px
        .ipt-con
            margin: 0 auto 20px
            width: 400px
            text-align: center
</style>
