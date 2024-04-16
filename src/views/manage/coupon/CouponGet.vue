PR<template>
    <div id="user_promoter_aduit_list">
        <!-- -----------------------------------筛选------------------------------------ -->
        <el-form :inline="true" size="medium">
            <!-- <el-form-item>
                <el-select placeholder="分销员类型" v-model="screenData.isInside" clearable>
                    <el-option value="" label="全部分销员"></el-option>
                    <el-option value="1" label="内部人员"></el-option>
                    <el-option value="0" label="普通人员"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select placeholder="状态" v-model="screenData.status" clearable>
                    <el-option value="" label="全部状态"></el-option>
                    <el-option value="1" label="审核通过"></el-option>
                    <el-option value="0" label="待审批"></el-option>
                    <el-option value="-1" label="不通关"></el-option>
                    <el-option value="2" label="普通用户"></el-option>
                </el-select>
            </el-form-item> -->

            <!-- <el-form-item>
                <el-input placeholder="手机号搜索" @keyup.enter.native="search" clearable v-model="screenData.mobile"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input placeholder="订单号搜索" @keyup.enter.native="search" clearable v-model="screenData.orderId"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input placeholder="用户名称/真实姓名" @keyup.enter.native="search" clearable v-model="screenData.realName"></el-input>
            </el-form-item> -->
            <el-form-item>
                <el-input placeholder="请输入优惠券名" clearable v-model="screenData.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input placeholder="请输入用户名" clearable v-model="screenData.userName"></el-input>
            </el-form-item>
            
            <el-form-item>
                <el-select v-model="screenData.status" placeholder="优惠券使用状态" clearable>
                    <el-option label="全部" value=" "> </el-option>
                    <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="screenData.isShop" placeholder="是否到店使用" clearable>
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
                <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- -----------------------------------列表------------------------------------ -->
        <el-table :data="list" stripe v-loading="loading" style="width: 100%">
            <el-table-column align="center" width="80" prop="id" label="订单号"></el-table-column>
            <el-table-column align="center" width="180px" prop="nick" label="分配对象">
                <template slot-scope="scope">
                    <el-image fit="cover" style="width: 60px; height: 60px" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"></el-image>
                    <p>{{ scope.row.nick }}</p>
                </template>
            </el-table-column>
            <el-table-column label="名称" prop="name" align="center"></el-table-column>

            <el-table-column label="优惠价格" align="center">
                <template slot-scope="scope">
                    <span class="error">￥{{ scope.row.amount }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" width="140px" prop="orderAmount" label="门槛金额">
                <template slot-scope="scope">
                    <span class="warning">￥{{ scope.row.useAmount }}</span>
                </template>
            </el-table-column>

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
            <el-table-column label="时间" align="center" width="250px">
                <template slot-scope="scope">
                    <div v-if="scope.row.status != 2">过期时间：{{ $moment(scope.row.useEndTime).format('Y-MM-DD HH:mm') }}</div>
                    <div v-if="scope.row.status == 2" class="success">使用时间：{{ $moment(scope.row.updateTime).format('Y-MM-DD HH:mm') }}</div>
                    <div class="warning">领取时间：{{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}</div>
                </template>
            </el-table-column>

            <!-- <el-table-column align="center" label="操作" width="150px" fixed="right">
                <template slot-scope="scope">
                    <el-button class="mybtn" type="primary" size="mini" @click="biaoshi(scope.row)">标识修改</el-button>
                    <el-button v-if="scope.row.status != 2" class="mybtn" type="warning" size="mini" @click="call(scope.row)">取消资格</el-button>
                    <el-button v-if="scope.row.status == 2" class="mybtn" type="success" size="mini" @click="regain(scope.row)">恢复资格</el-button>
                </template>
            </el-table-column> -->
        </el-table>

        <!-- 分页功能 -->
        <el-pagination
            class="margin_top20 align-right"
            background
            @current-change="pageChange"
            :current-page.sync="screenData.pageNo"
            :page-size="10"
            layout="total, prev, pager, next, jumper"
            :total="itemTotal"
        >
        </el-pagination>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectData: '',

            list: [], //数据
            loading: false,
            screenData: {
                usType: '', //筛选参数
                status: '',
                pageNo: 1,
                pageSize: 10,
                isInside: '',
                type: '',
                orderId: '',
                realName: '',
                userName:'',
                isShop:'',
            },
            itemTotal: 0,
            statusOptions: [
                { label: '未开始', value: 0, class: 'warning' },
                { label: '待使用', value: 1, class: 'success' },
                { label: '已使用', value: 2, class: 'error' },
                { label: '已过期', value: 3, class: 'info' },
            ],
            statusList: [
                { id: 0, name: '未开始' },
                { id: 1, name: '待使用' },
                { id: 2, name: '已使用' },
                { id: 3, name: '已过期' },
            ]
        }
        
        
    },

    watch: {},
    methods: {
        //--------------获取列表----------------------
        getList(pageNo) {
            this.loading = true;
            this.screenData.pageNo = pageNo || this.screenData.pageNo;
            this.$request.post({
                url: '/mt/coupon/receiveList',
                params: this.screenData,
                success: (res) => {
                    this.list = res.list;
                    this.itemTotal = res.total;
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },
        // 重置
        reset() {
            this.screenData = {
                //筛选参数
                usType: '', //筛选参数
                status: '',
                pageNo: 1,
                pageSize: 10,
                isInside: '',
                type: '',
                orderId: '',
                realName: ''
            };
            this.getList();
        },
        // 搜索
        search() {
            this.screenData.pageNo = 1;
            this.screenData.isCount = true;
            if (this.selectData && this.selectData.length) {
                this.screenData.startTime = this.$moment(this.selectData[0]).format('Y-MM-DD HH:mm:ss');
                this.screenData.endTime = this.$moment(this.selectData[1]).add(1, 'days').format('Y-MM-DD HH:mm:ss');
            } else {
                this.screenData.startTime = '';
                this.screenData.endTime = '';
                this.selectData = [];
            }
            this.getList(1);
        },

        //页面改变
        pageChange(current) {
            if (current) {
                this.screenData.pageNo = current;
                this.getList(this.screenData.pageNo);
            }
        }
    },
    created() {
        this.getList(1);
    }
};
</script>

<style scoped>
.mybtn {
    margin: 3px 10px;
}
.avatar {
    border-radius: 50%;
    width: 70px;
    height: 70px;
}
.dicc p {
    color: #888;
}
.tag_grade_pt {
    padding: 4px 6px;
    background-color: rgba(0, 0, 0, 0.041);
    border-radius: 3px;
    color: rgba(48, 48, 48, 0.822);
    border: 1px solid rgba(0, 0, 0, 0.096);
}
</style>
