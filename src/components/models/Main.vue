<template>
    <div :style="getWidth()">
        <el-main>
            <el-tabs v-model="tabsValue" style="margin-top: 3px" :closable="tabs.length > 1" @tab-remove="removeTab" type="card" @tab-click="tabClick" v-if="tabs.length">
                <el-tab-pane :label="item.label" :name="item.path" v-for="item in tabs" :key="item.path"> </el-tab-pane>
            </el-tabs>
            <div id="main">
                <transition :name="transitionName">
                    <div>
                        <keep-alive>
                            <router-view v-if="$route.meta.keepAlive"></router-view>
                        </keep-alive>
                        <router-view v-if="!$route.meta.keepAlive"></router-view>
                    </div>
                </transition>
            </div>
        </el-main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tabs: [],
            tabsValue: '',
            transitionName: 'slide-right',
            exclude: ['SeckillEdit', 'addOrUpdate']
        };
    },

    watch: {
        $route(to, form) {
            let isBack = this.$router.isBack;
            if (isBack) {
                this.transitionName = 'slide-left';
            } else {
                this.transitionName = 'slide-right';
            }
            this.$router.isBack = false;
        }
    },

    mounted() {
        this.$pubsub.subscribe('addTabs', (msg, value) => {
            this.addTab(value);
        });
    },

    methods: {
        getWidth() {
            var widthStr;
            if (this.$store.state.isPhone) {
                widthStr = 'width:100%';
            } else {
                widthStr = this.$store.state.navOpen ? 'width:calc(100vw - 200px);margin-left:200px;' : 'width:calc(100vw - 64px);margin-left:64px;';
            }
            return widthStr;
        },
        addTab(value) {
            var index = this.tabs.findIndex((item) => {
                return item.path == value.path;
            });
            if (index != -1) {
                this.tabsValue = this.tabs[index].path;
            } else {
                this.tabs.push(value);
                this.tabsValue = value.path;
            }
        },

        removeTab(targetName) {
            let tabs = this.tabs;
            let activeName = this.tabsValue;
            if (activeName === targetName) {
                tabs.forEach((tab, index) => {
                    if (tab.path === targetName) {
                        let nextTab = tabs[index + 1] || tabs[index - 1];
                        if (nextTab) {
                            activeName = nextTab.path;
                            this.$router.push(activeName);
                        }
                    }
                });
            }

            this.tabsValue = activeName;
            this.tabs = tabs.filter((tab) => tab.path !== targetName);
        },

        tabClick(tab) {
            this.$router.push(tab.name);
        }
    },

    beforeDestroy() {
        this.$pubsub.unsubscribe('addTabs');
    }
};
</script>

<style>
.el-main {
    padding: 10px 4px !important;
    box-sizing: border-box;
}

.el-main .el-tabs {
    background-color: white;
}
.el-main .el-tabs__item {
    height: 32px !important;
    line-height: 32px !important;
}

.el-main .el-tabs__header.is-top {
    line-height: 32px !important;
}

.el-main .el-tabs__header.is-top {
    min-height: 32px !important;
}

.el-main .el-tabs__content {
}

.el-tabs__header.is-top {
    min-height: 40px;
}

.el-tabs__nav {
    position: relative;
    left: 5px;
}

.slide-left-enter,
.slide-right-leave-to {
    opacity: 0;
    transform: translateX(3%);
    transition: 0.5s;
}

.slide-left-leave-to,
.slide-right-enter {
    opacity: 0;
    transform: translateX(-4%);
    transition: 0.5s ease-out 5s;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: 0.5s;
    position: absolute;
    z-index: -1;
    width: 100%;
}

.el-tabs__header.is-top {
    margin-bottom: 12px;
}
</style>

<style scoped>
#main {
    height: calc(100vh - 120px);
    overflow: auto;
    box-sizing: border-box;
    overflow-x: hidden;
    position: relative;
}

#main::-webkit-scrollbar {
    width: 8px;
}

#main::-webkit-scrollbar-track {
    background-color: transparent;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
}

#main::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.08);
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
}

#main:hover::-webkit-scrollbar-thumb {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.18);
    border-radius: 10px;
    -webkit-box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1);
}

#main > div {
    width: 100%;
    min-width: calc(100vw - 270px);
    padding: 10px 20px 20px 20px;
    box-sizing: border-box;
}
</style>
