<template>
    <div id="list">
        <!-- <el-form :inline="true" size="medium">
            <el-form-item>
                <el-input placeholder="******" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable @change="search">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
                <el-button type="success" @click="addOrUpdate">新增店铺</el-button>
            </el-form-item>
        </el-form> -->

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="id" prop="id" width="80" align="center"></el-table-column>
            <el-table-column label="店铺头像" align="center">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 80px; height: 80px" :src="scope.row.shopPhoto" :preview-src-list="[$fullPath(scope.row.shopPhoto)]"> </el-image>
                </template>
            </el-table-column>
            <el-table-column label="店铺名" prop="name" align="center"></el-table-column>
            <el-table-column label="店铺分类" prop="categoryName" align="center"></el-table-column>
            <el-table-column label="店铺电话" prop="phone" align="center"></el-table-column>
            <el-table-column label="海报" align="center">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 80px; height: 80px" :src="scope.row.banner" :preview-src-list="[$fullPath(scope.row.banner)]"> </el-image>
                </template>
            </el-table-column>
            <el-table-column label="店铺地址" prop="address" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column label="营业时间" align="center">
                <template slot-scope="scope">
                    {{ scope.row.startTime ? scope.row.startTime + '-' + scope.row.endTime : '未设置' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="update(scope.row)">修改</el-button>
                    <el-button type="warning" size="small" v-if="scope.row.status == 1" @click="updateStatus(scope.row.id, 2)">下架</el-button>
                    <el-button type="success" size="small" v-if="scope.row.status == 2" @click="updateStatus(scope.row.id, 1)">上架</el-button>
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
                isCount: true
            },
            list: [],
            total: 0,
            loading: false,
            selectData: []
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
            this.params.pageNo = pageNo;
            this.$request.post({
                url: 'mt/shop/list',
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
        addOrUpdate() {
            this.$router.push('/shop/addOrUpdate');
        },
        update(data) {
            sessionStorage.setItem('shopItem', JSON.stringify(data));
            this.$router.push('/shop/addOrUpdate?id=' + data.id);
        },
        // 上下架
        updateStatus(id, status) {
            let msg = status == 1 ? '该操作会上架改店铺和店内的所有商品， 确定上架吗？' : '该操作会下架该店铺和店内的所有商品， 确定下架吗？';
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                this.$request.post({
                    url: 'mt/shop/updateShopStatus',
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
</style>