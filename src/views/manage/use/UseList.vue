<template>
    <div>
        <el-card shadow="always" :body-style="{ padding: '20px' }">
            <div slot="header">
                <span>应用市场管理</span>
            </div>
            <!-- card body -->
            <div class="goods_box">
                <div :sm="12" :md="12" :lg="6" :xl="6" :offset="0" v-for="item in list" :key="item.id">
                    <div class="item_box">
                        <div class="item_img" @click="previewfunc(item)">
                            <el-image :src="item.cover" style="width: 100%; height: 100%" fit="fill" :lazy="true"></el-image>
                            <div class="img"><span class="textspan">详情</span><img src="../../../assets/svg/Rarrow.svg" style="color: #666" width="20px" /></div>
                        </div>
                        <div class="item_text">
                            <p class="title">
                                {{ item.name }}<span style="color: rgb(217, 0, 27); margin-left: 10px">{{ item.amount ? item.amount + '元/年' : '免费' }}</span>
                            </p>
                            <p class="text">{{ item.introduce }}</p>
                            <div :class="[item.status != 1 ? 'serve1' : 'serve2', 'btn']" @click="item.status != 1 ? open(item) : ''">
                                {{ item.status == 1 ? '已开通' : '立即开通' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
        <use-preview ref="preview_ref"></use-preview>
    </div>
</template>

<script>
import UsePreview from './chilcomps/UsePreview.vue';
export default {
    components: { UsePreview },
    data() {
        return {
            list: [],
            loading: false
        };
    },

    mounted() {
        this.getList(1);
    },

    methods: {
        // 显示预览 弹窗
        previewfunc(data) {
            this.$refs.preview_ref.show = true;
            this.$refs.preview_ref.info = JSON.parse(JSON.stringify(data));
        },
        // 获取账号列表
        getList() {
            this.load = true;
            this.$request.post({
                url: '/mt/app/list',
                success: (result) => {
                    this.list = result;
                    console.log(this.list);
                    this.total = result.total;
                },
                finally: () => {
                    this.load = false;
                }
            });
        },
        open(row) {
            const h = this.$createElement;
            this.$msgbox({
                title: '消息',
                message: h('p', null, [h('span', null, '将使用商户余额支付 '), h('i', { style: 'color: red' }, row.amount+'元' )]),
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = '购买中...';

                        this.$request.post({
                            url: '/mt/app/open',
                            params:{
                                appId:row.id
                            },
                            success: (result) => {
                                done();
                                this.getQueryOpen()
                                instance.confirmButtonLoading = false;
                            },
                            finally: () => {
                                done();
                                instance.confirmButtonLoading = false;
                                this.getQueryOpen()
                                this.getList()
                            }
                        });
                    } else {
                        done();
                    }
                }
            }).then((action) => {
                this.$message({
                    type: 'success',
                    message: '支付成功!'
                });
            });
        },
        // 获取应用 权限
        getQueryOpen() {
            this.$request.post({
                url: '/mt/app/queryOpen',
                success: (res) => {
                    this.$store.commit('GETQUERYOPEN', res);
                },
                finally: (err) => {}
            });
        }
    }
};
</script>

<style>
</style>

<style scoped>
.goods_box {
    display: flex;
    flex-direction: row;
    flex-grow: inherit;
    flex-wrap: wrap;
}
.goods_box > div {
    margin: 8px;
    width: 300px;
}
.item_box {
    height: 480px;
    border-radius: 5px;
    width: 300px;
    border: 1px solid #92929282;
    overflow: hidden;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.178) ;
}
.item_img {
    height: 300px;
    width: 100%;
    border-radius: 5px 5px 0 0px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
}
.item_text {
    border-top: 1px solid #92929282;
    border-radius: 0px 0px 5px 5px;
    position: relative;
    height: 160px;
    padding: 10px;
}
.item_text .btn {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    border-top: 1px solid #99955582;
    display: flex;
    align-items: center;
    color: #ffffff !important;
    font-size: 18px;
    font-weight: 500;
    justify-content: center;
    cursor: pointer;
}
.item_text .btn img {
    position: relative;
    top: 5px;
}
.item_text .btn > div {
    margin: 0 10px;
    cursor: pointer;
}
.item_text .text {
    line-height: 21px;
    font-size: 14px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 4;
    word-break: break-all;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}

.item_text .title {
    font-size: 18px;
    line-height: 30px;
}
.item_img .img {
    position: absolute;
    right: 10px;
    top: 10px;
}
.textspan {
    position: relative;
    top: -7px;
    font-size: 10px;
    opacity: 0.7;
    color: rgb(64, 158, 255);
}

.serve1 {
    background-color: rgb(0, 121, 254);
}
.serve2 {
    background-color: rgb(170, 170, 170);
}
</style>
