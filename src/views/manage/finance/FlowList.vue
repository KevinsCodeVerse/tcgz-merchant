<template>
    <div id="finance_flow">
        <el-form :inline="true" class="demo-form-inline" size="medium" :disabled="load">
            <el-form-item>
                <el-select v-model="requestParam.type" placeholder="支付类型" clearable @change="search">
                    <el-option value="" label="全部"></el-option>
                    <el-option value="1" label="收入"></el-option>
                    <el-option value="2" label="支出"></el-option>
                    <el-option value="3" label="冻结中"></el-option>
                    <el-option value="4" label="退款"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="date" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @change="search"> </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="handExport">导出流水</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="list" stripe style="width: 100%" v-loading="load">
            <el-table-column prop="id" label="id" align="center"></el-table-column>
            <el-table-column label="金额" width="120" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == 1" class="success">+ {{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 2" class="error">- {{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 3 && scope.row.status == 2" class="lanse"> {{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 3 && scope.row.status != 2" class="lanse"> {{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 5 && scope.row.status == 9" class="lanse">{{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 4 && scope.row.status != 9" class="info">- {{ $common.toThousands(scope.row.amount, true) }}</span>
                    <span v-if="scope.row.type == 4 && scope.row.status == 9" class="success">+ {{ $common.toThousands(scope.row.amount, true) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="descr" label="描述" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == 1" class="success">收入</span>
                    <span v-if="scope.row.type == 2" class="error">支出</span>
                    <span v-if="scope.row.type == 3" class="lanse">冻结中</span>
                    <span v-if="scope.row.type == 4" class="info">退款</span>
                    <span v-if="scope.row.type == 5" class="lanse">竞价冻结</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
        </el-table>
        <!-- <el-pagination
            class="page"
            background
            :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'"
            :total="total"
            @current-change="currentchange()"
            :current-page.sync="requestParam.pageNo"
            :page-size="requestParam.pageSize"
            @size-change="currentchange()"

        >
        </el-pagination> -->
        <el-pagination
            class="page"
            background
            @size-change="currentchange"
            @current-change="getList"
            :current-page.sync="requestParam.pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="requestParam.pageSize"
            :layout="$store.state.isPhone ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
            :total="total"
        ></el-pagination>
    </div>
</template>

<script>
export default {
    data() {
        return {
            list: [],
            requestParam: {
                usId: '',
                startTime: '',
                endTime: '',
                pageSize: 10,
                isCount: false,
                type: '',
                pageNo: 1
            },
            total: 0,
            load: false,
            date: []
        };
    },

    mounted() {
        this.search();
    },

    methods: {
        // 导出流水
        handExport() {
            if (this.load) {
                return;
            }
            this.load = true;
            this.$request.post({
                url: 'mt/flow/flowingExport',
                params: this.requestParam,
                success: res => {
                    console.log(this.$envConfig.serviceUrl + res);
                    let a = document.createElement('a');
                    a.setAttribute('href', this.$envConfig.serviceUrl + res);
                    a.click(); //下载
                    this.load = false;
                    this.$message.success('操作成功');
                    URL.revokeObjectURL(a.href); // 释放URL 对象
                },
                error: () => {},
                finally: () => {}
            });
        },
        // 分页 显示条目
        currentchange(e) {
            this.requestParam.pageSize = e;
            this.requestParam.pageNo = 1;
            this.getList();
        },
        // 获取列表
        getList() {
            if (this.load) {
                return;
            }
            if (this.date && this.date.length) {
                this.requestParam.startTime = this.$moment(this.date[0]).format('Y-MM-DD HH:mm:ss');
                this.requestParam.endTime = this.$moment(this.date[1]).format('Y-MM-DD HH:mm:ss');
            } else {
                this.date = [];
                this.requestParam.startTime = '';
                this.requestParam.endTime = '';
            }
            this.load = true;
            this.$request.post({
                url: 'mt/flow/getFlowing',
                params: this.requestParam,
                success: result => {
                    this.list = result.list;
                    if (this.requestParam.isCount) {
                        this.total = result.total;
                        this.requestParam.isCount = false;
                    }
                },
                finally: () => {
                    this.load = false;
                }
            });
        },

        search() {
            this.requestParam.isCount = true;
            this.getList();
        }
    }
};
</script>

<style></style>

<style scoped>
.lanse {
    color: #409eff;
}
</style>
