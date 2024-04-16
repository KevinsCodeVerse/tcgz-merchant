<template>
    <div class="wallet">
        <div class="info">
            <span>余额：{{info.balance}}元</span>
            <el-button size="mini" type="primary" @click="withdrawalVisible = true">提现</el-button>
        </div>
        <p class="wallet_title">提现记录</p>

        <el-table :data="list" v-loading="loading" stripe  fixed="right">
             <el-table-column label="ID" prop="id" align="center"></el-table-column>
            <el-table-column label="金额" prop="amount" align="center"></el-table-column>
            <el-table-column label="提现账户" prop="account" align="center">
                <template slot-scope="scope">
                    {{ scope.row.idCardName + '(' + scope.row.idcard.substring(scope.row.idcard.length-4) + ')' }}
                </template>
            </el-table-column>
            <el-table-column label="提现时间" align="center">
                <template slot-scope="scope">
                    {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
             <el-table-column label="审核时间" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 0" class="warning">审核中</span>
                    <span v-else>{{ $moment(scope.row.auditTime).format('Y-MM-DD HH:mm') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="审核者" align="center" prop=''>
                 <template slot-scope="scope">
                    <span v-if="scope.row.status == 0" class="warning">审核中</span>
                    <span v-else>{{scope.row.auditBy}}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 0" class="warning">审核中</span>
                    <span v-if="scope.row.status == 1" class="success">已通过</span>
                    <span v-if="scope.row.status == -1" class="error">已拒绝</span>
                </template>
            </el-table-column>
            <el-table-column label="拒绝原因" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.remark">{{scope.row.remark}}</span>
                    <span v-else>--</span>
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
            :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'"
            :total="total">
        </el-pagination>

        <el-dialog
        title="提现申请"
        :visible.sync="withdrawalVisible"
        width="450px">
            <el-form :inline="true" label-width="100px">
                <el-form-item label="提现金额">
                    <el-input v-model="dataForm.amount" placeholder="请输入提现金额" ></el-input>
                </el-form-item>
                <el-form-item label="提现银行卡">
                    <el-select v-model="dataForm.merchantBankId" placeholder="请选择提现银行卡">
                        <el-option
                        v-for="item in cardList"
                        :key="item.id"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="服务费">
                   ￥{{servePri(dataForm.amount,ServePrice.serviceCharge,ServePrice.serviceChargeLimit)}}
                </el-form-item>
                <el-form-item label="费率">
                  {{ServePrice.serviceCharge}}% (最低￥{{Number(ServePrice.serviceChargeLimit).toFixed(2)}})
                </el-form-item>
                
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="withdrawalVisible = false">取 消</el-button>
                <el-button type="primary" @click="withdrawal">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'wallet',
    data() {
        return {
            loading: false,
            info: {},
            list: [],
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true
            },
            total: 0,
            cardList: [],
            withdrawalVisible: false,
            dataForm: {
                amount: '',
                merchantBankId: '',
            },
            ServePrice:{}
        }
    },
    created(){
        this.getBalance();
        this.getBankList();
        this.getServePrice()
        this.getList(1);
    },
    activated() {
        this.getList(1);
        this.getBalance();
        this.getBankList();
    },
    mounted(){},
    watch: {},
    computed: {
        // servePri() {
        //     debugger
        //     let sxf = this.ServePrice.serviceCharge/100
        //     if(this.dataForm.money/sxf<this.ServePrice.serviceChargeLimit){
        //         return Number(this.dataForm.money*this.ServePrice.serviceCharge/100).toFixed(2)
        //     }else{
        //         return this.ServePrice.serviceChargeLimit
        //     }   
        // }
    },
    methods: {
        servePri(num1,num2,s) {
            let sxf = num2/100
            if(num1*sxf>s){
                return Number(num1*sxf).toFixed(2)
            }else{
                return s
            }   
        },
        getServePrice(){
            this.$request.post({
                url: 'general/query/public/serviceBank',
                params: {},
                success: (res) => {
                    this.ServePrice = res
                },
                error:()=>{},
                finally:()=>{}
            });
        },
        withdrawal() {
            if(this.loading) return;
            this.loading = true;
            if(!this.$common.isMoney(this.dataForm.amount)) {
                this.loading = false;
                this.$message.warning('请输入正确的金额');
                return;
            }
            if(this.dataForm.amount > this.info.balance) {
                this.loading = false;
                this.$message.warning('提现金额不能大于余额');
                return;
            }
            this.$request.post({
                 url: "mt/info/cashOut",
                 params: this.dataForm,
                 success: (result) => {
                     this.$message.success('操作成功');
                     this.withdrawalVisible = false;
                     this.getList(this.params.pageNo);
                     this.getBalance();
                 },
                 finally: () => {
                      this.loading = false;
                 },
            });
        },
        getBalance() {
            this.$request.post({
                 url: "mt/info/getBalance",
                 success: (result) => {
                     this.info = result;
                 }
            });
        },
        getList(pageNo) {
            this.loading = true
            this.params.pageNo = pageNo
            this.$request.post({
                url: 'mt/info/getCashOutList',
                params: this.params,
                success: result =>{
                    this.list = result.list 
                    if(this.params.isCount){
                        this.params.isCount = false 
                        this.total = result.total
                    }
                },
                finally: ()=>{
                    this.loading = false 
                }
            })
        },
        // 获取银行卡列表
        getBankList() {
            this.$request.post({
                url: 'mt/info/getBank',
                success: result =>{
                    this.cardList = []

                    for(let item of result) {
                        if(item.defaultIdcard == 1) {
                            this.dataForm.merchantBankId = item.id;
                        }
                        this.cardList.push({
                            label: item.idcardName + '(' + item.idcard.substring(item.idcard.length-4) + ')',
                            value: item.id
                        })
                    }
                }
            })
        },
        handleSizeChange(value) {
            this.params.pageSize = value;
            this.getList(this.params.pageNo)
        }
    }
}
</script>

<style lang="scss" scoped>
.wallet {
    .info {
        color: #666666;
        span {
            margin-right: 20px;
        }
    }
    .wallet_title {
        border-left: 5px solid #409eff;
        padding-left: 10px;
        font-size: 16px;
        margin-top: 20px;
        margin-bottom: 10px;
    }
}
</style>