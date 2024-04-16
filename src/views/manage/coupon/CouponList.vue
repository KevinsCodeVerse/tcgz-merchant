<template>
    <div id="">
        <el-form :inline="true" size="medium">
            <el-form-item>
                <el-input placeholder="请输入优惠券名" clearable v-model="params.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-select v-model="params.status" placeholder="优惠券发放状态" clearable>
                    <el-option label="全部" value=" "> </el-option>
                    <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="params.type" placeholder="优惠券状态" clearable>
                    <el-option label="全部" value=" "> </el-option>
                    <el-option label="上架" :value="1"> </el-option>
                    <el-option label="下架" :value="2"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="params.isShop" placeholder="是否到店使用" clearable>
                    <el-option label="全部" value=" "> </el-option>
                    <el-option label="到店使用" :value="1"> </el-option>
                    <el-option label="线上使用" :value="0"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable @change="search">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
                <el-button type="warning" @click="search">重置</el-button>
                <el-button type="success" @click="add" icon="el-icon-edit-outline">添加优惠券</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="id" prop="id" align="center"></el-table-column>
            <el-table-column label="名称" prop="name" align="center"></el-table-column>

            <el-table-column label="优惠价格" align="center">
                <template slot-scope="scope">
                    <span class="error">￥{{ scope.row.amount }}</span>
                </template>
            </el-table-column>
            <el-table-column label="优惠券数量" prop="count" align="left" min-width="140px" width="140px">
                <template slot-scope="scope">
                    <div>优惠券总数: {{ scope.row.count == -1 ? '不限' : scope.row.count }}</div>
                    <div>剩余优惠券: {{ scope.row.stock == -1 ? '不限' : scope.row.stock }}</div>
                </template>
            </el-table-column>
            <!-- <el-table-column label="封面" width="110" align="center">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 100px; height: 100px" :src="scope.row.cover | fullPath" :preview-src-list="[$fullPath(scope.row.cover)]"> </el-image>
                </template>
            </el-table-column> -->
            <el-table-column label="到店使用" align="center">
                <template slot-scope="scope">
                    <span :class="scope.row.isShop == 1 ? 'success' : 'warning'">{{ scope.row.isShop == 1 ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="优惠券状态" align="center" width="150px">
                <template slot-scope="scope">
                    <div v-for="item in statusOptions" :key="item.id" :class="item.class" v-show="item.value == scope.row.status">{{ item.label }}</div>
                </template>
            </el-table-column>

            <el-table-column label="发放时间" align="center" width="250px">
                <template slot-scope="scope">
                    <div>开始时间：{{ $moment(scope.row.sendStartTime).format('Y-MM-DD HH:mm') }}</div>
                    <div>结束时间：{{ $moment(scope.row.sendEndTime).format('Y-MM-DD HH:mm') }}</div>
                </template>
            </el-table-column>
            <el-table-column label="使用时间" align="center" width="250px">
                <template slot-scope="scope">
                    <div>开始时间：{{ $moment(scope.row.useStartTime).format('Y-MM-DD HH:mm') }}</div>
                    <div>结束时间：{{ $moment(scope.row.useEndTime).format('Y-MM-DD HH:mm') }}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="创建时间" width="110">
                <template slot-scope="scope">
                    <p>{{ $common.getDate(scope.row.createTime) }}</p>
                </template>
            </el-table-column>
            <el-table-column label="上下架" align="center" width="80px">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.type != 1" type="success" size="small" @click="updateStatus(scope.row.id, 1)">上架</el-button>
                    <el-button v-if="scope.row.type != 2" type="info" size="small" @click="updateStatus(scope.row.id, 2)">下架</el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px" fixed="right">
                <template slot-scope="scope">
                    <div>
                        <el-button type="primary" size="small" @click="update(scope.row)">编辑优惠券</el-button>
                        <el-button type="danger" size="small" @click="remove(scope.row.id)">删除优惠券</el-button>
                    </div>
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
    </div>
</template>
<script>
export default {
    data() {
        return {
            params: {
                pageNo: 1,
                pageSize: 10,
                count: true,
                name: '',
                status: '',
                type: '',
                isShop:'',
            },
            list: [],
            total: 0,
            loading: false,
            selectData: [],
            activityDialog: false,
            statusOptions: [
                { label: '未发放', value: 0, class: 'warning' },
                { label: '发放中', value: 1, class: 'success' },
                { label: '发放结束', value: 2, class: 'error' }
            ],
            statusList: [
                { id: 0, name: '未开始发放' },
                { id: 1, name: '发放中' },
                { id: 2, name: '发放结束' }
            ]
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
    },
    activated() {
        this.getList(this.params.pageNo);
    },
    methods: {
        handleSizeChange(value) {
            this.params.pageSize = value;
            this.search();
        },
        search() {
            this.params.pageNo = 1;
            this.params.count = true;
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
            this.params.pageNo = pageNo;
            this.$request.post({
                url: 'mt/coupon/list',
                params: this.params,
                success: (result) => {
                    this.list = result.list;
                    if (this.params.count) {
                        this.params.count = false;
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
            localStorage.removeItem('couponItem');
            this.$router.push('/coupon/CouponAdd');
        },
        // 编辑
        update(data) {
            localStorage.setItem('couponItem', JSON.stringify(data));
            this.$router.push('/coupon/CouponAdd?id=' + data.id);
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
                    url: 'mt/coupon/updateType',
                    params: {
                        id,
                        type: status
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
        // 删除
        remove(id) {
            this.$confirm('是否确定删除该优惠券？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                this.$request.post({
                    url: 'mt/coupon/delete',
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
        }
    }
};
</script>
   
<style>
</style>
   
<style scoped>
.page {
    text-align: right;
    margin-top: 20px;
}
.diPrice {
    display: flex;
    flex-wrap: wrap;
}
.diPrice div {
    text-align: right;
    margin-right: 15px;
    width: 100px;
}
.Dleft {
    text-align: left !important;
}
.diPriceBox {
    background: white;
    position: absolute;
    z-index: 99;
    padding: 10px;
    left: -50%;
    border-radius: 10px;
    box-shadow: 2px 2px 10px #0000002f;
    width: 400px;
    color: #666666;
}
</style>