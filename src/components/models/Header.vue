<template>
    <el-header>
        <div style="display: flex; align-items: center" :style="getWidth()">
            <div class="flexible_model">
                <i class="el-icon-s-fold flexible" v-show="$store.state.navOpen" @click="$store.state.navOpen = !$store.state.navOpen"></i>
                <i class="el-icon-s-unfold flexible" v-show="!$store.state.navOpen" @click="$store.state.navOpen = !$store.state.navOpen"></i>
            </div>

            <el-breadcrumb>
                <el-breadcrumb-item v-for="(data, index) in breadcrumbs" :key="index" :to="data.path">{{ data.name }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div></div>
        <div class="header_right">
            <!-- <div @click="showMessage=true">
                <i class="el-icon-bell"></i>
            </div> -->
            <div style="cursor: pointer" @click="openDrawer">
                <i class="el-icon-more-outline"></i>
            </div>
            <div>商户端</div>
        </div>
        <message-reminding :visible.sync="showMessage" ></message-reminding>
    </el-header>
</template>

<script>
import MessageReminding from '../common/MessageReminding.vue';
export default {
    components: { MessageReminding },
    data() {
        return {
            collapse: false,
            showMessage: false,
            breadcrumbs: []
        };
    },

    watch: {
        collapse(value) {
            this.$pubsub.publish('collapse', value);
        }
    },

    mounted() {
        this.$pubsub.subscribe('breadcrumb', (msg, value) => {
            this.breadcrumbs = value;
        });
    },

    methods: {
        openDrawer() {
            this.$pubsub.publish('openDrawer');
        },
        getWidth() {
            var widthStr;
            if (this.$store.state.isPhone) {
                widthStr = 'width:100%';
            } else {
                widthStr = this.$store.state.navOpen ? 'width:calc(100vw - 200px);margin-left:200px;' : 'width:calc(100vw - 64px);margin-left:64px;';
            }
            console.log(widthStr);
            return widthStr;
        }
    },

    beforeDestroy() {
        this.$pubsub.unsubscribe('breadcrumb');
    }
};
</script>

<style>
.el-header {
    height: 56px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    box-shadow: 0 2px 2px #cccccc;
    background-color: white;
}
</style>

<style scoped>
.flexible {
    font-size: 28px;
    cursor: pointer;
    color: #444444;
    margin-right: 20px;
}

.header_right {
    display: flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
}
.header_right > div {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: 100%;
}
.header_right i {
    font-size: 26px;
}
</style>
