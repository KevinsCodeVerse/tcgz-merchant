<template>
    <div id="user_info_model">
         <el-card class="box-card margin_top20" v-if="!readLoading" >
            <div slot="header" class="clearfix">
                <span>收益支出总概括</span>
            </div>
            <el-form :inline="true" size="medium">
                <div class="container">
                    <div class="block">
                        <el-date-picker
                        v-model="year"
                        type="year"
                        value-format="yyyy"
                        @change="timerFormData"
                        placeholder="选择年份">
                        </el-date-picker>
                    </div>
                 </div>
            </el-form>
            <div class="count" style="height: 150px;width: 70%;margin-left: 15%;margin-right: 15%;display: flex;justify-content: space-around;">
                <div>
                    <div class="font_text">{{year==''?'总收益':year+'年 总收益'}}</div>
                    <div class="data success">+ {{$common.toThousands(sumIncomePay.totalIncome, true)}}</div>
                </div>
                <div>
                    <div class="font_text">{{year==''?'总支出':year+'年 总支出'}}</div>
                    <div class="data error">- {{$common.toThousands(sumIncomePay.totalPay, true)}}</div>  
                </div>
            </div>
        </el-card>
        <el-card class="box-card margin_top20" v-if="!readLoading" >
            <div slot="header" class="clearfix">
                <span>商家信息</span>
            </div>
            <el-form label-width="100px" label-position="left" class="detail">
				
				<el-form-item label="店铺头像：">
					<el-image style="width: 80px; height: 80px" class="big_img bann" fit="cover" :src="info.shopPhoto | fullPath" :preview-src-list="[$envConfig.serviceUrl + info.shopPhoto]">
					</el-image>
				</el-form-item>
				<el-form-item label="店铺名：">{{ info.shopName || '--' }}</el-form-item>
                <el-form-item label="商户名：">{{ info.name || '--' }}</el-form-item>
                <el-form-item label="商家号码：">{{ info.phone || '--' }}</el-form-item>
                <el-form-item label="商家账号：">{{ info.account || '--' }}</el-form-item>
                <!-- <el-form-item label="行业：">{{ info.industryName || "--" }}</el-form-item> -->
                <!-- <el-form-item label="入驻时间：">{{ $common.getDate(info.createTime) || '--' }}</el-form-item> -->
                <el-form-item label="修改：">
                    <el-button type="text" @click="openDialog">修改</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-dialog
            id="updateInfo"
            title="修改信息"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            :before-close="onclose"
            center
            width="400px"
        >
            <el-form label-width="100px" label-position="left" :model="infoForm" :rules="rules" ref="infoForm"
                     @keyup.enter.native="updateInfo" >
                <el-form-item label="输入商户名" prop="name">
                    <el-input placeholder="请输入商户名"  v-model="infoForm.name" maxLength="20"/>
                </el-form-item>
                <el-form-item label="输入电话" prop="phone">
                    <el-input placeholder="请输入联系电话"  v-model="infoForm.phone" maxLength="11"/>
                </el-form-item>
                <el-form-item label="请选择行业" prop="industryId">
                     <el-select v-model="infoForm.industryId" placeholder="请选择行业">
                        <el-option
                        v-for="item in industryList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                    <el-input placeholder="请输入图片验证码"  v-model="infoForm.code" maxLength="4">
                        <template slot="append">
                            <ImgCode :sign.sync="infoForm.codeSign" ref="imgCode" style="width: 100px"/>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="align-center margin_top10">
                <el-button @click="dialogVisible = false; reset" :disabled="loading">取 消</el-button>
                <el-button type="primary" @click="updateInfo" :loading="loading">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import ImgCode from "@components/utils/ImgCode";
import rsa from '@/utils/rsa'
export default {
    components:{
        ImgCode
    },

    data() {
        return {
            info: {},
            dialogVisible: false,
            readLoading: false,
            loading: false,
            infoForm: {
                name: '',
                phone: '',
                industryId: '',
                code: '',
                codeSign: ''
            },
            year:'',
            sumIncomePay:{},
            rules: {
                name: {
                    message: '请输入商户名', trigger: 'blur', required: true
                },
                phone: {
                    trigger: 'blur', required: true, validator: (rule, value, callback) =>{
                        if (this.$common.isPhone(value)){
                            callback()
                        } else{
                            callback("请输入正确的电话号码");
                        }
                    }
                },
                industryId: {
                    message: '请选择行业', trigger: 'blur', required: true
                },
                code: [
                    {message: '请输入图片验证码', trigger: 'blur', required: true}
                ],
            },
            industryList:[]
        };
    },

    watch: {},

    create() {
    },

    mounted() {
        this.getInfo();
        this.timerFormData('')
        this.getIndustryList();
    },

    methods: {
		openDialog(){
			this.dialogVisible = true
			this.infoForm = {
				...this.info
			}
		},
        //获取行业
        getIndustryList(){
            this.$request.post({
                url: 'merchant/public/allList',
                success: result => {
                    this.industryList = result
                },
            })
        },
        getInfo() {
            this.readLoading = true
            this.$request.post({
                url: 'mt/info/getInfo',
                success: result => {
                    this.info = result
                },
                finally: ()=>{
                    this.readLoading = false
                }
            })
        },
        //获取收益
        timerFormData(year){
            if(year==''||year==null){
                this.year='';
            }
            this.readLoading = true
            this.$request.post({
                url: 'mt/flow/sumIncomePay',
                params: {year:year},
                success: result => {
                    this.sumIncomePay = result
                },
                finally: ()=>{
                    this.readLoading = false
                }
            })
        },

        updateInfo(){
            this.$refs.infoForm.validate(valid =>{
                if(valid){
                    this.loading = true
                    this.$request.post({
                        url: 'mt/info/updateInfo',
                        params: {
                            name:this.infoForm.name,
                            phone:this.infoForm.phone,
                            industryId:this.infoForm.industryId,
                            code:this.infoForm.code,
                            codeSign: this.infoForm.codeSign
                        },
                        success: result =>{
                            this.$message.success('修改成功')
                            this.dialogVisible=false
                            this.getInfo();
                        },
                        finally: ()=>{
                            this.loading = false
                            this.$refs.imgCode.getImgCode();
                        }
                    })
                }
            })
        },

        onclose(done){
            if(!this.loading){
                this.reset()
                done()
            }
        },

        reset(){
            for (var key in this.infoForm){
                this.infoForm[key] = ''
            }
        }
    },

    beforeDestroy() {
    }
}
</script>

<style>
#user_info .el-card .detail .el-form-item {
    margin-bottom: 10px !important;
}

#updateInfo .el-input-group__append{
    padding: 0px !important;
}
</style>

<style lang="scss" scoped>
.detail {
    margin-left: 20px;
}
#user_info_model .count .data{
    padding: 5px 0;
    text-align: center;
    font-size: 40px;
    font-weight: 600;
}

#user_info_model .count .font_text{
    padding: 5px 0;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
}
</style>
