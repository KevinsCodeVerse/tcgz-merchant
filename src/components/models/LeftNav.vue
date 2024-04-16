<template>
    <div id="left">
        <div v-if="$store.state.isPhone && $store.state.navOpen" @click="$store.state.navOpen = !$store.state.navOpen" class="mask"></div>
        <div id="nav" :style="getWidth()">
            <el-menu
                :default-active="active"
                class="el-menu-vertical-demo"
                @open="handleOpen"
                @close="handleClose"
                @select="handleSelect"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                :collapse="!$store.state.navOpen"
                router
                :default-openeds="openeds"
            >
                <el-menu-item index="-1" disabled>
                    <img src="@/assets/img/logo.png" alt="" height="20px" style="margin-right: 10px" />
                    <span slot="title">同城关注<span class="tesu">(商户端)</span></span>
                </el-menu-item>
                <el-scrollbar style="height: 100%; width: 100%">
                    <el-submenu
                        :index="index.toString()"
                        v-for="(item, index) in menuList"
                        :key="index"
                        :class="!$store.state.navOpen ? 'isCollapse' : ''"
                        :disabled="disableds(item)"
                    >
                        <template slot="title">
                            <i :class="item.menuIcon"></i>
                            <span slot="title" v-if="$store.state.navOpen">{{ item.label }}</span>
                            <span class="count" v-if="item.label == '订单管理' && counts.expressOrder > 0">{{ counts.expressOrder }}</span>
                            <span class="count" v-if="item.label == '拼团管理' && counts.expressGroupOrder > 0">{{ counts.expressGroupOrder }}</span>
                            <span class="count" v-if="item.label == '秒杀管理' && counts.expressSpikeOrder > 0">{{ counts.expressSpikeOrder }}</span>
                            <span class="count" v-if="item.label == '售后管理' && counts.afterSell > 0">{{ counts.afterSell }}</span>
                            <!-- <span class="count" v-if="item.label == '秒杀管理' && counts.afterSell > 0">{{ counts.afterSell }}</span> -->
                            <!-- <span class="count" v-if="item.label == '拼团管理' && counts.afterSell > 0">{{ counts.afterSell }}</span> -->
                        </template>
                        <el-menu-item :index="item2.requestUrl" v-for="(item2, index) in item.children" :key="index">
                            {{ item2.label }}
                            <!-- <span class="count" v-if="item2.label == '订单列表' && counts.expressOrder > 0">{{ counts.expressOrder }}</span> -->
                            <!-- <span class="count" v-if="item2.label == '售后列表' && counts.property > 0">{{ counts.property }}</span> -->
                            <!-- <span class="count" v-if="item2.label == '散户入驻审核/订单' && counts.firmAuditCount > 0">{{ counts.firmAuditCount }}</span> -->
                            <!-- <span class="count" v-if="item2.label == '集体提现列表' && counts.firmCount > 0">{{ counts.firmCount }}</span> -->
                            <!-- <span class="count" v-if="item2.label == '商户提现列表' && counts.merchantCount > 0">{{ counts.merchantCount }}</span> -->
                            <!-- <span class="count" v-if="item2.label == '商品订单列表' && counts.orderCount > 0">{{ counts.orderCount }}</span> -->
                        </el-menu-item>
                    </el-submenu>
                </el-scrollbar>
            </el-menu>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isCollapse: false,
            active: '',
            openeds: [],
            menuList: [],
            counts: {
                afterSell: 0, //待售后
                expressOrder: 0 //待发货
            }
        };
    },

    watch: {
        router(value) {
            this.active = this.$route.path;
            this.setByRoute();
        }
    },

    computed: {
        router() {
            return this.$route.path;
        }
    },

    created() {
        this.defaultActiveIndex = this.$route.fullPath;

        var item = JSON.parse(sessionStorage.getItem('menuList'));
        // 获取所有根节点
        var parents = [];
        item.filter((item) => {
            return item.parentId == -1;
        }).forEach((item) => {
            parents.push({
                id: item.id,
                label: item.menuName,
                requestUrl: item.requestUrl,
                menuIcon: item.menuIcon
            });
        });
        // 获取所有子节点
        var childrens = [];
        item.filter((item) => {
            return item.parentId != -1 && item.flag == 1;
        }).forEach((item) => {
            childrens.push({
                id: item.id,
                label: item.menuName,
                parentId: item.parentId,
                requestUrl: item.requestUrl,
                menuIcon: item.menuIcon
            });
        });

        // 生成菜单树
        this.menuList = this.$common.translator(parents, childrens, (current) => {
            // 定义树的数据结构
            return {
                id: current.id,
                label: current.label,
                parentId: current.parentId,
                requestUrl: current.requestUrl,
                menuIcon: current.menuIcon
            };
        });
    },

    mounted() {
        this.getCount();
        this.$pubsub.subscribe('collapse', (msg, value) => {
            this.isCollapse = value;
        });

        this.active = this.$route.path;

        setTimeout(() => {
            this.setByRoute();
        }, 200);

        // 监听 售后与订单发货
        this.$bus.$on('refreshOrder', () => {
            this.getCount();
        });
    },

    methods: {
        handleOpen(key, keyPath) {},

        handleClose(key, keyPath) {},

        handleSelect(index, path) {
            if (this.$store.state.isPhone) {
                this.$store.state.navOpen = false;
            }
            if (!this.menuList[Number(path[0])]) {
                return;
            }
            var children =
                this.menuList[Number(path[0])].children[
                    this.menuList[Number(path[0])].children.findIndex((item) => {
                        return item.requestUrl == path[1];
                    })
                ];

            var menuItem = this.menuList[Number(path[0])];

            this.$pubsub.publish('breadcrumb', [
                {
                    name: menuItem.label
                },
                {
                    name: children.label
                }
            ]);

            this.$pubsub.publish('addTabs', {
                parentLabel: menuItem.label,
                path: children.requestUrl,
                label: children.label
            });
        },

        setByRoute() {
            var i = -1;
            var j = -1;
            this.menuList.forEach((item, index) => {
                if (item.children) {
                    item.children.forEach((item2, index2) => {
                        if (item2.requestUrl == this.active) {
                            i = index;
                            j = index2;
                        }
                    });
                }
            });
            this.handleSelect(this.active, [i.toString(), this.active]);
        },
        selectNav(index) {
            if (this.$store.state.isPhone) {
                this.$store.state.navOpen = false;
            }
        },
        getWidth() {
            var widthStr;
            if (this.$store.state.isPhone) {
                widthStr = this.$store.state.navOpen ? 'width: 200px;' : 'width:0px;';
            } else {
                widthStr = this.$store.state.navOpen ? 'width: 200px;' : 'width:64px;';
            }
            return widthStr;
        },

        disableds(item) {
            return (item.label == '分销管理' && this.$store.state.use.use['4'] != 1)||(item.label == '拼团管理' && this.$store.state.use.use['1'] != 1)||(item.label == '秒杀管理' && this.$store.state.use.use['2'] != 1)||(item.label == '优惠券管理' && this.$store.state.use.use['3'] != 1);
        },
        getCount() {
            this.$request.post({
                url: 'mt/afterSell/pendingOrder',
                success: (result) => {
                    this.counts = result;
                }
            });
        }
    }
};
</script>

<style>
@import url('../../assets/fonts/icon.css');
.el-menu {
    border-right: none;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 210px;
    box-sizing: border-box;
}

.el-menu-vertical-demo.el-menu {
    height: 100vh;
    border-right: 0px !important;
}

.el-menu--inline .el-menu-item {
    background-color: #1f2d3d !important;
}

.el-menu--inline .el-menu-item:hover {
    background-color: black !important;
}

.el-menu-item.is-disabled {
    opacity: 1 !important;
    cursor: default;
    background: transparent !important;
}

.el-submenu__title {
    display: flex;
    align-items: center;
}

.el-submenu__title i {
    color: #d1d5dd;
    vertical-align: middle;
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
}

.el-menu .el-scrollbar__wrap {
    overflow-x: hidden;
}

.el-submenu__title {
    height: 48px !important;
    line-height: 48px !important;
}

.el-submenu .el-menu-item {
    height: 43px !important;
    line-height: 43px !important;
}

.isCollapse .el-submenu__icon-arrow.el-icon-arrow-right {
    display: none;
}

.el-menu .el-scrollbar__view {
    padding-bottom: 55px;
}
</style>

<style scoped>
#left .mask {
    background: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}
.count {
    background: #f56c6c;
    height: 20px;
    line-height: 20px;
    padding: 0 6px 0 5px;
    border-radius: 50px;
    box-sizing: border-box;
    margin-left: 5px;
}
#left #nav {
    position: fixed;
    height: 100vh;
    max-width: 200px;
    width: 200px;
    left: 0;
    top: 0;
    background: #545c64;
    overflow: hidden;
    transition: width 0.3s;
    z-index: 1001;
}
#left .nav_icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
}
#left .tesu {
    font-size: 12px;
    color: #999;
}
</style>
