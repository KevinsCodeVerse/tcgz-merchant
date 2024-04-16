<template>
    <div>
        <el-dialog title="详情介绍" :visible.sync="show" width="50%" @close="close">
            <div class="title">
                <div class="item_img" @click="previewfunc(item)">
                    <el-image :src="info.cover" style="width: 100%; height: 100%" fit="fill" :lazy="true"></el-image>
                </div>
                <div>
                    <div class="name">
                        {{ info.name }}
                        <span v-if="type == 1" style="color: rgb(217, 0, 27); font-size: 22px; line-height: 80px">{{ info.amount ? '￥' + info.amount + ' 元/年' : '免费' }}</span>
                    </div>
                    <div v-if="type == 0" style="color: rgb(217, 0, 27); font-size: 22px; line-height: 80px">{{ info.amount ? '￥' + info.amount + ' 元/年' : '免费' }}</div>
                    <div class="btn" v-if="type == 1">
                        <span class="time">有效期至: {{ $common.getDate(info.dueTime) }}</span>
                        <el-button type="primary" size="mini" class="btn_bt" style="border-right: 5px" @click="open(info)">立即续费</el-button>
                    </div>
                    <div style="color: rgb(130, 130, 130); font-size: 18px; line-height: 30px">{{ info.introduce }}</div>
                </div>
            </div>
            <div class="info">
                <div class="title_box">
                    <span class="gezi"></span>
                    <div>详情介绍</div>
                </div>
            </div>
            <div v-html="info.content"></div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: Number
        }
    },
    components: {},
    data() {
        return {
            show: false,
            info: {},
            type: 0
        };
    },
    methods: {
        name() {},
        // 关闭弹窗后
        close() {
            this.show = false;
        },
        // 请求列表数据
        getList() {
            this.request.post({
                url: '',
                params: {},
                success: (res) => {
                    this.list = res;
                }
            });
        },
        open(row) {
            const h = this.$createElement;
            this.$msgbox({
                title: '消息',
                message: h('p', null, [h('span', null, '将使用商户余额支付 '), h('i', { style: 'color: red' }, row.amount + '元')]),
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = '购买中...';

                        this.$request.post({
                            url: '/mt/app/open',
                            params: {
                                appId: row.id
                            },
                            success: (result) => {
                                done();
                                instance.confirmButtonLoading = false;
                                this.$emit('open');
                                this.show = false;
                            },
                            finally: () => {
                                done();
                                instance.confirmButtonLoading = false;
                                this.$emit('open');
                                this.show = false;
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
        }
    }
};
</script>

<style scoped>
.item_img {
    height: 300px;
    min-width: 300px;
    width: 300px;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    border: 1px solid #92929282;
    margin-right: 25px;
}
.title {
    display: flex;
}

.name {
    font-size: 26px;
    font-weight: 600;
}
.gezi {
    background-color: rgb(64, 158, 255);
    width: 8px;
    height: 26px;
    margin-right: 5px;
}
.title_box {
    font-size: 18px;
    display: flex;
    margin: 20px 0;
}
.info {
}

.btn {
    display: flex;
    align-items: center;
    color: #ffffff !important;
    font-size: 16px;
    font-weight: 500;
    line-height: 80px;
}
.time {
    color: rgb(245, 158, 43);
    line-height: 20px;
    margin: 20px 0;
    margin-right: 20px;
}
.btn_bt {
}
</style>