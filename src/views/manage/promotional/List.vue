

// 推广素材管理
<template>
    <div id="">
        <el-form :inline="true" size="medium">
            <el-form-item>
                <el-input placeholder="请输入商品名" clearable v-model="params.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable @change="search">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
                <el-button type="success" @click="add" icon="el-icon-edit-outline">添加商品</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="id" prop="id" align="center" width="60px"></el-table-column>
            <el-table-column label="产品名" prop="name" align="center" width="130px"></el-table-column>
            <el-table-column label="产品主图" align="center" min-width="200px" width="350px">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 200px; height: 200px" :src="scope.row.cover | fullPath" :preview-src-list="[$fullPath(scope.row.cover)]"> </el-image>
                </template>
            </el-table-column>
            <el-table-column label="产品轮播图" align="center" min-width="250px" width="250px">
                <template slot-scope="scope">
                    <el-carousel height="200px" width="200px">
                        <el-carousel-item v-for="item in scope.row.banner" :key="item">
                            <el-image fit="cover" style="width: 200px; height: 200px" :src="item | fullPath" > </el-image>
                        </el-carousel-item>
                    </el-carousel>
                </template>
            </el-table-column>
            <el-table-column label="推广海报" align="center" min-width="162px" width="182px">
                <template slot-scope="scope">
                    <el-image fit="fill" style="width: 162px; height: 297px" :src="scope.row.inviteImage | fullPath" :preview-src-list="[$fullPath(scope.row.inviteImage)]">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column label="推广文案" prop="inviteContent" align="center" width="162px"> </el-table-column>
            <el-table-column label="配送方式" prop="carriage" align="center"> </el-table-column>
            <el-table-column align="center" label="创建时间" width="110">
                <template slot-scope="scope">
                    <p>{{ $common.getDate(scope.row.createTime) }}</p>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="160px">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.status == 2" type="success" size="small" @click="updateStatus(scope.row.id, 1)">上架</el-button>
                    <el-button v-if="scope.row.status == 1" type="danger" size="small" @click="updateStatus(scope.row.id, 2)">下架</el-button>
                    <el-button type="primary" size="small" @click="update(scope.row.id)">编辑</el-button>
                    <el-button type="danger" size="small" icon="el-icon-delete" @click="remove(scope.row.id)">删除</el-button>
                    <el-button type="warning" size="small" @click="$router.push('/product/seckill_edit?id=' + scope.row.id)">设置秒杀</el-button>
                    <el-button type="warning" size="small" @click="$router.push('/product/group_edit?id=' + scope.row.id)">设置团购</el-button>
                    <el-button type="primary" size="small" @click="updatamaterial(scope.row)">推广素材管理</el-button>
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

        <el-dialog title="营销活动" :visible.sync="activityDialog" @close="clearDialog" width="500px">
            <el-form :inline="true" size="medium" label-width="80px">
                <el-form-item label="营销类型">
                    <el-radio-group v-model="activityForm.type">
                        <el-radio :label="1" border>秒杀</el-radio>
                        <el-radio :label="2" border>拼团</el-radio>
                    </el-radio-group>
                </el-form-item>
                <br />
                <el-form-item label="活动时间">
                    <el-date-picker v-model="timeArr" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
                </el-form-item>
                <div v-if="activityForm.type == 1">
                    <el-form-item label="活动时间">
                        <el-date-picker v-model="timeArr" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
                    </el-form-item>
                </div>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <updata ref="updata" @updata="getList"></updata>
    </div>
</template>
<script>
import Updata from './chilcomps/updata.vue';
export default {
    components: {
        Updata
    },
    data() {
        return {
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                name: '',
                isInvite: 1
            },
            list: [],
            total: 0,
            loading: false,
            selectData: [],
            activityDialog: false,
            activityForm: {
                type: 1, //1秒杀 2拼团
                activityStartTime: '',
                activityEndTime: '',
                activityInventory: 100,
                peopleNum: 0,
                activityPrice: ''
            },
            timeArr: []
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
    },

    methods: {
        // 显示素材管理对话框
        updatamaterial(row) {
            this.$refs.updata.imgs = row.inviteImage;
            this.$refs.updata.show = true;
            this.$refs.updata.params.id = row.id;
            this.$refs.updata.params.inviteContent = row.inviteContent;
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
            this.params.pageNo = pageNo || 1;
            this.$request.post({
                url: 'mt/pro/list',
                params: this.params,
                success: (result) => {
                    result.list.forEach(element => {
                        element.banner = element.banner.split(',')
                    });
                    this.list = result.list
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
        // 设置秒杀活动
        addSeckill() {},
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
            this.$router.push('/product/addOrUpdate?id=' + id);
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
                    url: 'mt/pro/deletePro',
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
</style>