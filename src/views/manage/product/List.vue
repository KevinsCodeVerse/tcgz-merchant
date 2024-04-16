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
                <el-select v-model="params.sort" placeholder="选择排序">
                    <el-option
                        v-for="item in sortList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
                <el-button type="success" @click="add" icon="el-icon-edit-outline">添加商品</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="id" prop="id" align="center"></el-table-column>
            <el-table-column label="产品名" prop="name" align="center"></el-table-column>
            <el-table-column label="积分" prop="weightSort" align="center"></el-table-column>
            <el-table-column label="运费" prop="name" align="center">
                <template slot-scope="scope">
                    <span :class="scope.row.freight != 0 ? 'warning' : 'success'">{{ scope.row.freight == 0 ? '包邮' : '￥' + scope.row.freight }}</span>
                </template>
            </el-table-column>
            <el-table-column label="商品价格" align="center">
                <template slot-scope="scope">
                    <span class="error">￥{{ scope.row.price }}</span>
                </template>
            </el-table-column>
            <el-table-column label="开启应用" align="center" width="160px">
                <template slot-scope="scope">
                    <div>拼团: <span class="error" v-if="scope.row.isGroup == 0">未开启</span><span class="success" v-if="scope.row.isGroup != 0">已开启</span></div>
                    <div>秒杀: <span class="error" v-if="scope.row.isSpike == 0">未开启</span><span class="success" v-if="scope.row.isSpike != 0">已开启</span></div>
                    <div v-if="scope.row.isInvite == 0">分销: <span class="error">未开启</span></div>
                    <div v-if="scope.row.isInvite != 0">
                        分销: <span class="success" style="z-index: 500" @mouseenter="mouseenter(scope.row)" @mouseleave="mouseleave(scope.row)">已开启</span>
                    </div>
                    <div v-if="scope.row.reward && scope.row.isShowReward" class="diPriceBox" @mouseenter="mouseenter(scope.row)" @mouseleave="mouseleave(scope.row)">
                        <h3>佣金分成</h3>
                        <div class="diPrice">
                            <div>普通会员:</div>
                            <div class="Dleft">直推: ￥{{ scope.row.reward[0] }}</div>
                            <div class="Dleft">间推: ￥{{ scope.row.reward[1] }}</div>
                        </div>
                        <div class="diPrice">
                            <div>黄金会员:</div>
                            <div class="Dleft">直推: ￥{{ scope.row.reward[2] }}</div>
                            <div class="Dleft">间推: ￥{{ scope.row.reward[3] }}</div>
                        </div>
                        <div class="diPrice">
                            <div>合伙人:</div>
                            <div class="Dleft">直推: ￥{{ scope.row.reward[4] }}</div>
                            <div class="Dleft">间推: ￥{{ scope.row.reward[5] }}</div>
                        </div>
                        <div class="diPrice">
                            <div>至尊合伙人:</div>
                            <div class="Dleft">直推: ￥{{ scope.row.reward[6] }}</div>
                            <div class="Dleft">间推: ￥{{ scope.row.reward[7] }}</div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="浏览量" prop="pv" align="center"></el-table-column>
                <el-table-column label="销量" prop="deal" align="center"></el-table-column>
                <el-table-column label="收藏量" prop="favor" align="center"></el-table-column>
                <el-table-column label="评论量" prop="evaluation" align="center"></el-table-column>
                <el-table-column label="是否推送" prop="goodScore" align="center">
                    <template slot-scope="scope">
                        <span :class="scope.row.goodScore == 0 ? 'warning' : 'success'">{{ scope.row.goodScore == 0 ? '未开通' : '已开通'  }}</span>
                    </template>
                </el-table-column>
            <el-table-column label="产品主图" width="110" align="center">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 100px; height: 100px" :src="scope.row.cover | fullPath" :preview-src-list="[$fullPath(scope.row.cover)]"> </el-image>
                </template>
            </el-table-column>
            <el-table-column label="配送方式" prop="carriage" align="center"> </el-table-column>
            <el-table-column align="center" label="创建时间" width="110">
                <template slot-scope="scope">
                    <p>{{ $common.getDate(scope.row.createTime) }}</p>
                </template>
            </el-table-column>

            <el-table-column label="上下架" align="center" width="80px">
                <template slot-scope="scope">
                    <el-button type="success" class="m-10" size="small" @click="allotLabel(scope.row)">标签</el-button>
                    <el-button v-if="scope.row.status == 2" type="success" size="small" @click="updateStatus(scope.row.id, 1)">上架</el-button>
                    <el-button v-if="scope.row.status == 1" type="info" size="small" @click="updateStatus(scope.row.id, 2)">下架</el-button>
                </template>
            </el-table-column>
            <el-table-column label="下架原因" align="center" show-overflow-tooltip>
                <template slot-scope="scope" >
                    <div class="error" v-if="scope.row.remark&&scope.row.status == 2">下架原因:{{scope.row.remark}}</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px" fixed="right">
                <template slot-scope="scope">
                    <div>
                        <el-button type="primary" size="small" @click="update(scope.row.id)">编辑商品</el-button>
                        <el-button type="danger" size="small" @click="remove(scope.row.id)">删除商品</el-button>
                    </div>
                    <div>
                        <el-button v-if="$store.state.use.use['2'] == 1" type="warning" size="small" @click="$router.push('/seckill/seckill_edit?id=' + scope.row.id)" >设置秒杀</el-button >
                        <el-button v-if="$store.state.use.use['1'] == 1" type="warning" size="small" @click="$router.push('/group/group_edit?id=' + scope.row.id)" >设置团购</el-button >
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
        <d-alllabel v-model="labelVisible" :ids="Did" :type="type" :labelData="labelData" @refresh="getList"></d-alllabel>
    </div>
</template>
<script>
import DAlllabel from './childComponent/D_Alllabel.vue';
export default {
    components: {
        DAlllabel
    },
    data() {
        return {
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                name: '',
                sort:'',
            },
            sortList: [
                {label: '默认排序',value: ''},
                { label: "积分升序", value: "weightSort" },
                { label: "积分降序", value: "weightSortDesc" },
                { label: "价格升序", value: "price" },
                { label: "价格降序", value: "priceDesc" },
            ],
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
            timeArr: [],
            // 标签
            labelVisible: false,
            Did: -1,
            type: 1,
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
        // 鼠标移除
        mouseleave(row) {
            row.isShowReward = false;
        },
        // 监听鼠标经过
        mouseenter(row) {
            row.isShowReward = true;
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
                url: 'mt/pro/list',
                params: this.params,
                success: (result) => {
                    result.list.forEach((item) => {
                        item.isShowReward = 0;
                    });
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
            this.$confirm('是否确定删除该商品？', '提示', {
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
    z-index: 9999;
   
    padding: 5px 10px;
    top: 2%;
    left: -50%;
    border-radius: 10px;
    box-shadow: 2px 2px 10px #0000002f;
    width: 400px;
    color: #666666;
}
</style>