<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { gotoPath } from '@renderer/api'
import request from '../../../utils/request.js'
import { ElMessageBox } from 'element-plus'
import { Minus, Close, SwitchButton } from '@element-plus/icons-vue'
// router钩子，返回路由器实例
const router = useRouter()
const ipcRenderer = window.electron?.ipcRenderer
const tableData = ref([
    {
        id: 1,
        name: 'tomcat',
        target: '127.0.0.1:8080',
        port: '8080',
        status: 'running',
        externalUrl: 'https://www.baidu.com'
    }
])
const dialogFormVisible = ref(false)
const demandDialogFormVisible = ref(false)

const formLabelWidth = '140px'
const tableHeight = ref(0)
const activeItem = ref('home')
const vkey = ref('')
const topHeight = 140
window.onresize = () => {
    tableHeight.value = document.body.clientHeight - topHeight
}
tableHeight.value = document.body.clientHeight - topHeight
const settingForm = reactive({
    startup: true
})

const state = reactive({
    form: {
        port: '',
        target: '',
        name: ''
    }
})

// 登录
const goto = (path) => {
    router.push(path)
}

const handleClick = (type) => {
    ipcRenderer.send('command', type, {})
}

const handleRow = (type, row) => {
    if (type == 'edit') {
        state.form = row
        dialogFormVisible.value = true
    } else if (type == 'delete') {
        tableData.value = tableData.value.filter((item) => item.id != row.id)
        tableData.value = tableData.value.filter((item) => item.id != row.id)
    }
}

//显示添加域名映射
const showAddDemandMapping = () => {
    state.form = {
        port: '',
        target: '',
        name: ''
    }
    demandDialogFormVisible.value = true
}

//显示添加映射
const showAddMapping = () => {
    state.form = {
        port: '',
        target: '',
        name: ''
    }
    dialogFormVisible.value = true
}

const changeTabs = (name) => {
    activeItem.value = name
}

// 获取Electron版本号 - 给主进程发送消息并异步等待结果
const getElectronVersion = () => {
    ipcRenderer.invoke('getElectronVersion').then((result) => {
        ElMessageBox.alert(result, 'Electron版本号', {
            confirmButtonText: 'OK'
        })
    })
}

const addMapping = async () => {
    const { status, msg } = await request.postForm('/index/add', {
        vkey: vkey.value,
        remark: state.form.name,
        type: 'tcp',
        port: null,
        client_id: null,
        target: state.form.target
    })
    if (status === 1) {
        ElMessageBox.alert(msg, '增加映射成功', {
            confirmButtonText: 'OK'
        })
    } else {
        ElMessageBox.alert(msg, '增加映射失败', {
            confirmButtonText: 'OK'
        })
    }
}

//getElectronVersion()
const addClient = async () => {
    const hardwareUuid = await ipcRenderer.invoke('getHardwareUUID')
    const { status, msg } = await request.postForm('/client/add', { vkey: vkey })
    if (status === 1 || msg.indexOf('Vkey duplicate') > -1) {
        //如果成功或者已经存在
        vkey.value = hardwareUuid
    } else {
        ElMessageBox.alert(msg, '增加客户端失败', {
            confirmButtonText: 'OK'
        })
    }
}

const init = async () => {
    //增加客户端，如果有则不增加
    await addClient()
}
init()
</script>

<template>
    <div class="container">
        <div class="content">
            <div class="left">
                <div
                    class="item"
                    :class="activeItem == 'home' ? 'active' : ''"
                    @click="changeTabs('home')"
                >
                    首页
                </div>
                <div
                    class="item"
                    :class="activeItem == 'settings' ? 'active' : ''"
                    @click="changeTabs('settings')"
                >
                    设置
                </div>
                <div
                    class="item"
                    :class="activeItem == 'about' ? 'active' : ''"
                    @click="changeTabs('about')"
                >
                    关于
                </div>
            </div>
            <div class="right-home">
                <div class="title-bar draggable">
                    <el-icon class="icon" @click="handleClick('min')"><Minus /></el-icon>
                    <el-icon class="icon-close" @click="handleClick('close')"><Close /></el-icon>
                </div>
                <div class="title">
                    已使用
                    <el-text type="warning"
                        >（流量每2元/GB ，无期限限制，1000Mb宽带，关于成本：0.8元/GB + 服务器租赁费
                        ）</el-text
                    >
                </div>
                <div class="desc">
                    <el-text style="font-size: 30px; font-weight: bold"> 2.55GB </el-text>
                    / 10GB
                </div>
                <el-button type="primary" @click="showAddDemandMapping">域名映射</el-button>
                <el-button type="primary" @click="showAddMapping">其他映射</el-button>
                <el-button type="primary" @click="dialogFormVisible = true">购买流量</el-button>
                <div class="tabs" :style="'height: ' + tableHeight + 'px'">
                    <el-table
                        v-if="activeItem == 'home'"
                        :data="tableData"
                        style="width: 100%"
                        height="100%"
                    >
                        <el-table-column prop="name" label="应用名称" width="140" />
                        <el-table-column prop="localPort" label="内网目标" width="100" />
                        <el-table-column prop="externalUrl" label="外网访问地址" />

                        <el-table-column class="row-opt" label="操作" width="150">
                            <template #default="scope">
                                <el-button
                                    link
                                    type="danger"
                                    @click="handleRow('delete', scope.row)"
                                    >删除</el-button
                                >
                                <el-button link type="primary" @click="handleRow('edit', scope.row)"
                                    >修改</el-button
                                >
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="settings" v-if="activeItem == 'settings'">
                        <el-form :model="settingForm">
                            <el-form-item label="开机启动">
                                <el-switch v-model="settingForm.startup" />
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="about" v-if="activeItem == 'about'">
                        <div class="about-title-first">关于</div>
                        <div class="about-desc">
                            本软件为个人开发，不以盈利为目的，如有问题请联系微信(手机号)：18392447939
                        </div>
                        <div class="about-title">初衷</div>
                        <div class="about-desc">
                            实现一款可按量付费的内网穿透工具，让用户可以随时随地的访问内网服务，如：内网网站测试、内网数据库、与第三方联调接口等。
                        </div>
                        <div class="about-title">为什么千兆宽带下载只有1-2Mb？</div>
                        <div class="about-desc">
                            这个和内网电脑的带宽有关，家庭带宽上行一般只有30Mbps，30Mbps的理论对应的下载速度为：30/8
                            = 3.75Mb/s。
                            但是实际速度会受到很多因素的影响，比如网络拥堵、服务器带宽、网络延迟等，所以实际下载速度可能会低于理论值。
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <el-dialog v-model="dialogFormVisible" title="增加映射" width="500">
        <el-form :model="state.form">
            <el-form-item label="应用名称" :label-width="formLabelWidth">
                <el-input
                    v-model="state.form.name"
                    placeholder="请输入应用名称"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="目标" :label-width="formLabelWidth">
                <el-input
                    v-model="state.form.target"
                    placeholder="请输入ip:port"
                    autocomplete="off"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="addMapping">确定</el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog v-model="demandDialogFormVisible" title="增加映射" width="500">
        <el-form :model="state.form">
            <el-form-item label="应用名称" :label-width="formLabelWidth">
                <el-input
                    v-model="state.form.name"
                    placeholder="请输入应用名称"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="目标" :label-width="formLabelWidth">
                <el-input
                    v-model="state.form.target"
                    placeholder="请输入ip:port"
                    autocomplete="off"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="demandDialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="addMapping">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="stylus">
.draggable
    -webkit-app-region: drag
    padding 0 0

.container
  height 100vh
  display flex
  flex-direction column
  .content
    display flex
    .left
      height: 100vh
      width 23%
      background-color rgb(94, 107, 157)
      color #ffffff
      .item
        height 50px
        width 100%
        line-height 50px
        text-align center
        cursor pointer
        &:hover
          font-weight bold
          background-color rgb(74,89,146)
      .active
        background-color rgb(74,89,146)
        border-left 4px solid #ffffff

    .right-home
      height: 100vh
      width 79%
      background-color rgb(241, 244, 255)
      padding 0px 10px
      .tabs
        display block
        background-color #ffffff
        margin 10px 0px
        .about
          padding 10px
          .about-title-first
            font-size 20px
            font-weight bold
            margin 0px
          .about-title
            font-size 20px
            font-weight bold
            margin 20px 0px 0px 0px
          .about-desc
            margin-top 10px
            font-size 14px
            color #666666
        .settings
          padding 10px

      .title-bar
        height: 30px
        display: flex
        align-items: center
        justify-content: right
        .icon
            -webkit-app-region: no-drag
            width 30px
            height 30px
            margin 0 0px
            cursor pointer
            color #666666
            &:hover
              color #ffffff
              background-color #999999
        .icon-close
            -webkit-app-region: no-drag
            width 30px
            height 30px
            margin 0 0px
            cursor pointer
            color #666666
            &:hover
                color #ffffff
                background-color #ff0000
        .logo
            width 100px
            height 30px
</style>
