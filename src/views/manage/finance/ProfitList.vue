<template>
    <div id="finance_profit">
        <el-form :inline="true" class="demo-form-inline" size="medium" :disabled="load">
            <el-form-item>
                <el-date-picker
                    v-model="date"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="search"
                >
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="list" stripe style="width: 100%" v-loading="load">
            <el-table-column prop="id" label="id" align="center"></el-table-column>
            <el-table-column label="收益金额" width="140" align="center">
                <template slot-scope="scope">
                      <span v-if="scope.row.type == 1" class="success">+ {{ $common.toThousands(scope.row.money, true) }}</span>
                    <span v-if="scope.row.type == 2" class="error">- {{ $common.toThousands(scope.row.money, true) }}</span>
                    <span v-if="scope.row.type == 4" class="info"> {{ $common.toThousands(scope.row.money, true) }}</span>
                    <span v-if="scope.row.type == 3" class="lanse"> {{ $common.toThousands(scope.row.money, true) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="origin" label="收益来源" align="center"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center"></el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="page"
            background
            @size-change="currentchange"
            @current-change="getList"
            :current-page.sync="requestParam.pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="requestParam.pageSize"
            :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'"
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
                startTime: '',
                endTime: '',
                pageSize: 10,
                pageNo: 1
            },
            total: 0,
            load: false,
            date: [],
        };
    },

    created() {
        this.search()
    },

    methods: {
        // 分页 显示条目
        currentchange(e){
            this.requestParam.pageSize = e
            this.requestParam.pageNo = 1
            this.getList()
        },

        // 获取列表
        getList(pageNo) {
            if (this.load) {
                return;
            }
            if (this.date && this.date.length) {
                this.requestParam.startTime = this.$moment(this.date[0]).format('Y-MM-DD HH:mm:ss')
                this.requestParam.endTime = this.$moment(this.date[1]).format('Y-MM-DD HH:mm:ss')
            } else {
                this.date = [];
                this.requestParam.startTime = ''
                this.requestParam.endTime = ''
            }
            this.load = true
            this.requestParam.pageNo = pageNo
            this.$request.post({
                url: 'mt/profit/list',
                params: this.requestParam,
                success: result => {
                    this.list = result.list
                    if (this.requestParam.isCount) {
                        this.total = result.total
                    }
                },
                finally: () => {
                    this.load = false
                }
            })
        },

        search() {
            this.requestParam.isCount = true
            this.getList(1)
        }
    }
}

</script>

<style>
</style>
