<template>
    <div id="">
        <el-tabs v-model="tabStatus" @tab-click="search">
            <el-tab-pane label="全部" name="-10"></el-tab-pane>
            <el-tab-pane v-for="item in statusList" :label="item.name" :name="item.id.toString()" :key="item.id"></el-tab-pane>
        </el-tabs>
        <el-form :inline="true" size="medium">
            <el-form-item>
                <el-input placeholder="请输入订单编号" v-model="params.id" clearable></el-input>
            </el-form-item>
            <!-- <el-form-item>
                <el-input placeholder="请输入联系人姓名" v-model="params.userName" clearable></el-input>
            </el-form-item> -->
            <el-form-item>
                <el-select v-model="params.afterSellType" placeholder="请选择类型" clearable>
                    <el-option label="全部" value=""> </el-option>
                    <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable @change="search">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="订单编号" prop="userOrderPay.id" align="center"></el-table-column>
            <el-table-column label="产品信息" prop="userOrderPay.proId" align="center" width="150px">
                <template slot-scope="scope">
                    <img class="avatar" :src="scope.row.userOrderPay.proInfo.avatar | fullPath" alt="" />
                    <p>{{ scope.row.userOrderPay.proInfo.title }}</p>
                    <p v-if="scope.row.userOrderPay.proInfo.specName">{{ scope.row.userOrderPay.proInfo.specName }}</p>
                    <p>单价：{{ scope.row.userOrderPay.proInfo.unitPrice }}</p>
                    <p>数量：{{ scope.row.userOrderPay.count }}</p>
                </template>
            </el-table-column>
            <el-table-column label="用户信息" prop="" align="center">
                <template slot-scope="scope">
                    <div v-if="scope.row.user">
                        <img class="avatar" :src="scope.row.user.avatar | fullPath" alt="" />
                        <p>{{ scope.row.user.nick }}</p>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="订单总额" prop="userOrderPay.totalAmount" align="center"></el-table-column>
            <el-table-column label="支付金额" prop="userOrderPay.payAmount" align="center"></el-table-column>
            <el-table-column label="退款金额" prop="userAfterSell.amount" align="center">
                <template slot-scope="scope">
                    <div class="error">{{ scope.row.userAfterSell ? '￥' + scope.row.userAfterSell.amount : '-' }}</div>
                </template>
            </el-table-column>
            <el-table-column label="联系手机号" prop="userOrderPay.phone" align="center"></el-table-column>
            <el-table-column label="配送方式" align="center">
                <template slot-scope="scope">
                    <el-tag type="info" size="mini" v-if="scope.row.userOrderPay.carriage == 1">自提</el-tag>
                    <el-tag type="success" size="mini" v-else>快递</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="订单状态" align="center">
                <template slot-scope="scope">
                    <span :class="statusStr(scope.row.userOrderPay.afterSellStatus).class">{{ statusStr(scope.row.userOrderPay.afterSellStatus).name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="退款状态" align="center">
                <template slot-scope="scope">
                    <div class="error" v-if="scope.row.userOrderPay.afterSellType == 1">仅退款</div>
                    <div class="warning" v-if="scope.row.userOrderPay.afterSellType == 2">退货退款</div>
                </template>
            </el-table-column>
            <el-table-column label="支付时间" align="center">
                <template slot-scope="scope">
                    {{ scope.row.userOrderPay.payTime ? $moment(scope.row.userOrderPay.payTime).format('Y-MM-DD HH:mm') : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    {{ $moment(scope.row.userOrderPay.createTime).format('Y-MM-DD HH:mm') }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button class="mybtn" type="success" size="small" @click="isMessageShow(scope.row)" v-if="isRefund(scope.row)">处理售后</el-button>
                    <el-button class="mybtn" type="primary" size="small" @click="goDetail(scope.row.userOrderPay.id)">查看详情</el-button>
                    <!-- <el-button size="small" type="success" v-if="scope.row.status == 10" @click="(deliveryData.id = scope.row.userOrderPay.id), (deliveryShow = true)"
                        >发货</el-button
                    > -->
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            class="page margin_top20 align-center"
            background
            @size-change="handleSizeChange"
            @current-change="getList"
            :current-page.sync="params.pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="params.pageSize"
            :layout="$store.state.isPhone ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
            :total="total"
        >
        </el-pagination>

        <!-- 弹框 -->
        <el-dialog title="发货" :visible.sync="deliveryShow" width="520px" center @close="closeDialog">
            <el-form :model="deliveryData" :rules="deliveryRules" ref="refDelivery" label-width="120px">
                <el-form-item label="物流公司名称" prop="express">
                    <el-input placeholder="请输入物流公司名称" v-model="deliveryData.express"></el-input>
                </el-form-item>

                <el-form-item label="物流单号" prop="expressNum">
                    <el-input placeholder="请输入物流单号" v-model="deliveryData.expressNum"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deliveryShow = false">取 消</el-button>
                <el-button type="primary" @click="doDelivery()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 查看退款详情 -->
        <el-dialog title="售后说明" :visible.sync="messageShow" width="520px">
            <el-form label-width="80px" v-if="messageInfo.userAfterSell" size="normal">
                <el-form-item label="订单状态">
                    {{ messageInfo.userOrderPay.status == 1 ? '未使用' : '' }}
                    {{ messageInfo.userOrderPay.status == 10 ? '未发货' : '' }}
                    {{ messageInfo.userOrderPay.status == 11 ? '已发货' : '' }}
                    {{ messageInfo.userOrderPay.afterSellStatus == 3 ? '已寄回' : '' }}
                </el-form-item>
                <el-form-item label="类型">
                    {{ messageInfo.userOrderPay.afterSellType == 1 ? '仅退款' : '退货退款' }}
                </el-form-item>
                <el-form-item label="退款原因">
                    {{ messageInfo.userAfterSell.reason }}
                </el-form-item>
                <el-form-item label="退款金额">
                    <div class="error">￥{{ messageInfo.userAfterSell.amount }}</div>
                </el-form-item>
                <el-form-item label="凭证">
                    <div>{{ messageInfo.userAfterSell.remark ? messageInfo.userAfterSell.remark : '无' }}</div>
                    <el-image
                        style="width: 100px; height: 100px"
                        v-for="item in messageInfo.userAfterSell.img"
                        :key="item"
                        :src="item"
                        :preview-src-list="messageInfo.userAfterSell.img"
                    >
                    </el-image>
                </el-form-item>
                <el-form-item label="快递公司">
                    <div >{{ messageInfo.userAfterSell.refundShip }}</div>
                </el-form-item>
                <el-form-item label="快递单号">
                    <div >{{ messageInfo.userAfterSell.refundShipNo }}</div>
                </el-form-item>
            </el-form>

            <span slot="footer">
                <el-button type="danger" @click="doMessageShow(2)">拒 绝</el-button>
                <el-button type="primary" @click="doMessageShow(1)">同 意</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 售后
            messageShow: false,
            messageInfo: {},

            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                afterSellType: ''
            },
            tabStatus: '-10',
            list: [],
            order: {}, //订单数据
            userAfterSell: {}, //售后信息
            user: {}, //用户信息
            total: 0,
            loading: false,
            selectData: [],
            deliveryShow: false, // 发货弹框
            // 订单发货
            deliveryData: {
                id: '',
                express: '',
                expressNum: ''
            },
            deliveryRules: {
                express: {
                    message: '请输入物流公司名称',
                    required: true,
                    tirgger: 'blur'
                },
                expressNum: {
                    message: '请输入物流单号',
                    required: true,
                    tirgger: 'blur'
                }
            },
            statusList22: [
                { id: 0, name: '待支付' },
                { id: 1, name: '待使用' },
                { id: 10, name: '待发货' },
                { id: 11, name: '待收货' },
                { id: 2, name: '待评价' },
                { id: 3, name: '已评价' },
                { id: -1, name: '已退款' },
                { id: -2, name: '已取消' }
            ],
            statusList: [
                { id: 1, name: '待同意' },
                { id: 2, name: '已同意退货' },
                { id: 3, name: '退货运输中' },
                { id: 4, name: '已拒绝退货退款' },
                { id: 5, name: '已寄回拒绝退款' },
                { id: 7, name: '已拒绝仅退款' },
                { id: 8, name: '用户已取消' },
                { id: 10, name: '已退款' },
                { id: 11, name: '仲裁未通过/售后失败' },
                { id: 12, name: '售后过期' }
            ],
            typeList: [
                { id: 1, name: '仅退款' },
                { id: 2, name: '退货退款' }
            ]
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
    },

    methods: {
        // 判断 是否
        isRefund(row) {
            return row.userOrderPay.afterSellStatus == 1 || row.userOrderPay.afterSellStatus == 3;
        },
        // 查看退款详情
        doMessageShow(action) {
            let reason = '';
            if (action == 1) {
                let str = this.messageInfo.userOrderPay.afterSellType == 1 ? '用户申请仅退款, 如果同意, 钱将原路返回! 是否继续?' : '是否同意 退货退款 , 同意后用户即可填写物流订单';
                if (this.messageInfo.userOrderPay.afterSellStatus == 3) str = '用户已将货物寄回, 是否同意退款?';
                this.$confirm(str, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success'
                })
                    .then(() => {
                        const loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading'
                        });
                        this.$request.post({
                            url: 'mt/afterSell/auditApply',
                            params: {
                                action,
                                orderId: this.messageInfo.userOrderPay.id,
                                reason
                            },
                            success: () => {
                                this.$bus.$emit('refreshOrder'); //刷新 new订单
                                this.$message.success('确认成功!');
                                this.messageShow = false;
                                this.getList(1);
                            },
                            finally: () => {
                                loading.close();
                            }
                        });
                    })
                    .catch(() => {});
            } else {
                this.$prompt('请输入拒绝原因', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                })
                    .then(({ value }) => {
                        if (!value) {
                            this.$message.error('拒绝原因,不能为空');
                            return;
                        }
                        const loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading'
                        });
                        this.$request.post({
                            url: 'mt/afterSell/auditApply',
                            params: {
                                action,
                                orderId: this.messageInfo.userOrderPay.id,
                                reason: value
                            },
                            success: () => {
                                this.$bus.$emit('refreshOrder'); //刷新 new订单
                                this.$message.success('已拒绝!');
                                this.messageShow = false;
                                this.getList(1);
                            },
                            finally: () => {
                                loading.close();
                            }
                        });
                    })
                    .catch(() => {});
            }
        },
        isMessageShow(row) {
            this.messageInfo = row;
            this.messageShow = true;
        },
        // 重置
        reset() {
            (this.params = {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                afterSellType: ''
            }),
                this.getList(1);
        },
        // 查看详情
        goDetail(id) {
            this.$router.push({
                path: '/order/orderDetail',
                query: {
                    id: id
                }
            });
        },
        // 关闭 弹窗后
        closeDialog() {
            this.deliveryData = {
                id: '',
                express: '',
                expressNum: ''
            };
        },
        handleSizeChange(value) {
            this.params.pageSize = value;
            this.search();
        },
        search() {
            this.params.pageNo = 1;
            this.params.isCount = true;
            if (this.selectData && this.selectData.length) {
                this.params.startTime = this.$moment(this.selectData[0]).format('Y-MM-DD HH:mm:ss');
                this.params.endTime = this.$moment(this.selectData[1]).add(1, 'days').format('Y-MM-DD HH:mm:ss');
            } else {
                this.params.startTime = '';
                this.params.endTime = '';
                this.selectData = [];
            }
            this.getList(1);
        },
        //获取列表
        getList(pageNo) {
            this.loading = true;
            this.params.pageNo = pageNo;
            this.params.afterSellStatus = this.tabStatus == -10 ? '' : this.tabStatus;
            this.$request.post({
                url: 'mt/afterSell/list',
                params: this.params,
                success: (result) => {
                    for (var item of result.list) {
                        item.userOrderPay.proInfo = JSON.parse(item.userOrderPay.proInfo);
                        if (item.userAfterSell) item.userAfterSell.img = item.userAfterSell.img ? JSON.parse(item.userAfterSell.img) : [];
                    }
                    this.list = result.list;
                    if (this.params.isCount) {
                        this.params.isCount = false;
                        this.total = result.total;
                    }
                    console.log(result);
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },

        // 发货操作
        doDelivery() {
            this.$refs['refDelivery'].validate((valid) => {
                if (valid) {
                    if (this.loading) {
                        return;
                    }
                    this.loading = true;
                    this.$request.post({
                        url: 'mt/order/delivery',
                        params: this.deliveryData,
                        success: (res) => {
                            this.$store.dispatch('routes/getRemind', 1);
                            this.$message.success('订单发货成功');
                            this.getList(1);
                            this.deliveryShow = false;
                        },
                        finally: () => {
                            this.loading = false;
                        }
                    });
                }
            });
        },

        // 不同状态颜色
        statusStr(status) {
            let name = '-';
            this.statusList.forEach((item) => {
                if (item.id == status) {
                    name = item.name;
                }
            });
            let statusClass = '';
            if (status == -1 || status == -2 || status == 4 || status == 5 || status == 7) {
                statusClass = 'error';
            }
            if (status == 1 || status == 2 || status == 3) {
                statusClass = 'warning';
            }
            if (status == 2 || status == 3) {
                statusClass = 'success';
            }
            if (status == 10 || status == 3) {
                statusClass = 'primarys';
            }
            return { class: statusClass, name };
        }
    },

    beforeDestroy() {}
};
</script>
   
<style>
</style>
   
<style lang="scss" scoped>
.page {
    text-align: right;
    margin-top: 20px;
}
.avatar {
    width: 50px;
    height: 50px;
    border-radius: 10px;
}
.primarys {
    color: rgb(0, 216, 0);
}
</style>