<template>
    <div id="">
        <el-form :inline="true" size="medium" class="seckill">
            <el-form-item>
                <el-input placeholder="请输入商品名" clearable v-model="params.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable @change="search">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="id" prop="id" align="center"></el-table-column>
            <el-table-column label="产品名" prop="title" align="center"></el-table-column>
            <el-table-column label="产品主图" align="center">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 100px; height: 100px" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"> </el-image>
                </template>
            </el-table-column>
            <el-table-column label="普通商品原价" align="center">
                <template slot-scope="scope">
                    <span class="warning">￥{{ scope.row.originPrice }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品价格" align="center">
                <template slot-scope="scope">
                    <span class="error">￥{{ scope.row.spikePrice }}</span>
                </template>
            </el-table-column>
            <el-table-column label="剩余商品数量" prop="stock" align="center"> </el-table-column>
             <el-table-column label="运费" prop="name" align="center">
                <template slot-scope="scope">
                    <span :class="scope.row.freight != 0 ? 'warning' : 'success'">{{ scope.row.freight == 0 ? '包邮' : '￥' + scope.row.freight }}</span>
                </template>
            </el-table-column>

            <el-table-column label="配送方式" prop="carriage" align="center"> </el-table-column>
            <el-table-column label="活动状态" align="center" show-overflow-tooltip>
                <template slot-scope="scope" >
                    <el-tag size="mini" v-if="scope.row.status == 0">未开始</el-tag>
                    <el-tag size="mini" type="warning" v-if="scope.row.status == 1">进行中</el-tag>
                    <el-tag size="mini" type="info" v-if="scope.row.status == -1">已结束</el-tag>
                    <div class="error" v-if="scope.row.remark&&scope.row.status == -1">下架原因:{{scope.row.remark}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="秒杀时间" width="160">
                <template slot-scope="scope">
                    <p>{{ $common.getDate(scope.row.startTime) }}</p>
                    <b class="warning">至</b>
                    <p>{{ $common.getDate(scope.row.endTime) }}</p>
                </template>
            </el-table-column>
           
            <el-table-column label="状态操作" align="center" width="80px">
                <template slot-scope="scope">
                    <el-button type="success" class="m-10" size="small" @click="allotLabel(scope.row)">标签</el-button>
                    <el-tooltip :disabled="!isStatus(scope.row)" content="活动已结束, 请编辑结束时间大于当前时间" effect="dark" placement="top">
                        <el-button v-if="!isStatus(scope.row)" :type="scope.row.status == 1 ? 'warning' : 'success'" size="small" @click="statusSet(scope.row)">
                            {{ scope.row.status == 1 ? '结束' : '开启' }}
                        </el-button>
                        <el-button v-else :type="scope.row.status == 1 ? 'warning' : 'success'" class="btnFalse" size="small">
                            {{ scope.row.status == 1 ? '结束' : '开启' }}
                        </el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px" fixed="right">
                <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="update(scope.row.id)">编辑商品</el-button>
                    <el-button type="danger" size="small" @click="remove(scope.row.id)">删除商品</el-button>
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
        <d-alllabel v-model="labelVisible" :ids="Did" :type="type" :labelData="labelData" @refresh="getList"></d-alllabel>
    </div>
</template>
<script>
import DAlllabel from '../product/childComponent/D_Alllabel.vue';
export default {
    components: { DAlllabel },
    data() {
        return {
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                name: ''
            },
            list: [],
            total: 0,
            loading: false,
            selectData: [],
            timeArr: [],
            // 标签
            labelVisible: false,
            Did: -1,
            type: 2,
            labelData: ''
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
    },
    activated() {
        this.getList();
    },
    methods: {
       
        // 分配标签
        allotLabel(row) {
            this.Did = row.id;
            this.labelVisible = true;
            this.labelData = row.afterSellIdent || '';
        },
        // 判断是否过期
        isStatus(row) {
            let nowTime = Date.now();
            return nowTime > row.endTime || row.status == 0;
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
        getList(pageNo) {
            this.loading = true;
            this.params.pageNo = pageNo || this.params.pageNo;
            this.$request.post({
                url: 'mt/seckill/pro/list',
                params: this.params,
                success: (result) => {
                    this.list = result.list;
                    if (this.params.isCount) {
                        this.params.isCount = false;
                        this.total = result.total;
                    }
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },
        // 添加商品
        add() {
            this.$router.push('/product/addOrUpdate');
        },
        // 活动状态管理
        statusSet(row) {
            this.$request.post({
                url: '/mt/seckill/pro/updateSeckillProStatus',
                params: {
                    id: row.id,
                    status: row.status == 1 ? -1 : 1
                },
                success: (res) => {
                    this.$message.success('操作成功');
                    this.getList(1);
                }
            });
        },
        // 上下架
        updateStatus(id, status) {
            let msg = status == 1 ? '是否确定上架此商品？' : '是否确定下架此商品？';
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                this.$request.post({
                    url: 'mt/pro/updateProStatus',
                    params: {
                        id,
                        status
                    },
                    success: (result) => {
                        this.$message.success('操作成功');
                        this.getList(this.params.pageNo);
                    },
                    finally: () => {
                        this.loading = false;
                    }
                });
            });
        },
        // 编辑
        update(id) {
            this.$router.push(`/seckill/seckill_edit?id=${id}&type=2`);
        },
        // 删除
        remove(id) {
            this.$confirm('是否确定删除改商品？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                this.$request.post({
                    url: 'mt/seckill/pro/delete',
                    params: {
                        id
                    },
                    success: (result) => {
                        this.$message.success('操作成功');
                        this.getList(this.params.pageNo);
                    },
                    finally: () => {
                        this.loading = false;
                    }
                });
            });
        },
        activityDetail() {},
        // 设置营销方案
        addActivity() {
            this.activityDialog = true;
        },
        clearDialog() {}
    },

    beforeDestroy() {}
};
</script>
   
<style>
</style>
   
<style scoped>
.page {
    text-align: right;
    margin-top: 20px;
}
.seckill {
    padding-top: 15px;
    padding-left: 15px;
    margin-bottom: 15px;
    background-color: rgba(255, 99, 71, 0.089);
    border-radius: 3px;
}
.btnFalse {
    cursor: no-drop;
}
</style>