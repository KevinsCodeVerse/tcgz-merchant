<template>
    <div style="text-algin: center; width: 1500px">
        <el-button type="primary" @click="$router.go(-1)" size="mini">返 回</el-button>
        <div style="text-algin: center; display: flex">
            <div class="card" shadow="never">
                <p><b>优惠券信息</b></p>
                <el-form :rules="rules" :model="form" ref="form" size="small" style="padding: 20px" label-position="right" label-width="150px">
                    <!-- <el-form :rules="rules" :model="info" ref="form" size="small" style="padding: 20px" label-position="right" label-width="150px" :disabled="form.status == 1"> -->
                    <el-form-item label="优惠券名称：" prop="name">
                        <el-input type="text" v-model="form.name" style="width: 320px" maxlength="6" show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item label="优惠金额：" prop="amount">
                        <el-input type="Number" v-model="form.amount" style="width: 150px" oninput="value = value<1?1:(value>999?999:value.replace(/[-|.]/g,''))">
                            <template slot="append">元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="消费门槛金额：" prop="useAmount">
                        <el-input type="Number" v-model="form.useAmount" style="width: 150px" oninput="value = value<0.01?0.01:(value>99999?99999:value.replace(/[-]/g,''))">
                            <template slot="append">元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="优惠券总数：" prop="count">
                        <el-input
                            v-if="isCount"
                            type="Number"
                            v-model="form.count"
                            style="width: 150px"
                            placeholder="请输入优惠券总数"
                            oninput="value = value<1?1:(value>9999?9999:value.replace(/[.]/g,''))"
                        >
                            <template slot="append">张</template>
                        </el-input>
                        <el-switch v-model="isCount" active-text="自定义" inactive-text="不限" style="margin: 0 30px" @change="isCount ? (form.count = 1) : -1"> </el-switch>
                    </el-form-item>
                    <el-form-item label="每人限领数：" prop="userLimitCount">
                        <el-input
                            v-if="isUserLimitCount"
                            type="Number"
                            v-model="form.userLimitCount"
                            style="width: 150px"
                            placeholder="请输入每人限领数"
                            oninput="value = value<1?1:(value>9999?9999:value.replace(/[.]/g,''))"
                        >
                            <template slot="append">张</template>
                        </el-input>
                        <el-switch
                            v-model="isUserLimitCount"
                            active-text="自定义"
                            inactive-text="不限"
                            style="margin: 0 30px"
                            @change="isUserLimitCount ? (form.userLimitCount = 1) : -1"
                        >
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="到店使用：" prop="isShop">
                        <el-radio v-model="form.isShop" label="0">否</el-radio>
                        <el-radio v-model="form.isShop" label="1">是</el-radio>
                    </el-form-item>
                    <el-form-item label="是否上架：" prop="type">
                        <el-radio v-model="form.type" label="2">否</el-radio>
                        <el-radio v-model="form.type" label="1">是</el-radio>
                    </el-form-item>

                    <el-form-item label="领取时间：" prop="sendTime">
                        <el-date-picker
                            v-model="form.sendTime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="使用时间：" prop="useTime">
                        <el-date-picker
                            v-model="form.useTime"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="优惠券使用开始时间"
                            end-placeholder="优惠券使用结束时间"
                            class="input-border-null"
                            prefix-icon="el-icon-alarm-clock"
                            value-format="yyyy-MM-dd HH:mm:ss"
                        ></el-date-picker>
                    </el-form-item>
                     
                   
                    <el-form-item label="优惠券使用范围：" prop="type">
                        <el-form-item label="普通商品：" label-width="100px" prop="type">
                            <el-radio v-model="form.isPro" label="0">否</el-radio>
                            <el-radio v-model="form.isPro" label="1">是</el-radio>
                        </el-form-item>
                        <el-form-item label="拼团商品：" label-width="100px" prop="type">
                            <el-radio v-model="form.isGroup" label="0">否</el-radio>
                            <el-radio v-model="form.isGroup" label="1">是</el-radio>
                        </el-form-item>
                        <el-form-item label="秒杀商品：" label-width="100px" prop="type">
                            <el-radio v-model="form.isSpike" label="0">否</el-radio>
                            <el-radio v-model="form.isSpike" label="1">是</el-radio>
                        </el-form-item>
                    </el-form-item>
                     <el-form-item>
                        <el-button type="primary" @click="$router.go(-1)">返 回</el-button>
                        <el-button type="warning" @click="add">保 存</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="card" shadow="never" style="width: 400px" v-if="id">
                <p><b>信息</b></p>
                <el-form :model="form" size="small" style="padding: 20px" label-position="right" label-width="120px" disabled>
                    <el-form-item label="剩余总数：">
                        <el-input :value="stock">
                            <template slot="append">张</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="已领取：">
                        <el-input :value="receiveCount">
                            <template slot="append">张</template>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="距离领取结束：">
                        <el-input :value="sendEndTime">
                            <template slot="append">天</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="距离使用结束：">
                        <el-input :value="useEndTime">
                            <template slot="append">天</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CouponAdd',
    computed: {
        stock() {
            return this.form.stock > 0 ? this.form.stock : '不限';
        },
        receiveCount() {
            return this.form.receiveCount || 0;
        },
        sendEndTime() {
            return this.form.sendEndTime - Date.now() > 0 ? ((this.form.sendEndTime - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(2) : '已结束';
        },
        useEndTime() {
            return this.form.useEndTime - Date.now() > 0 ? ((this.form.useEndTime - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(2) : '已结束';
        }
    },
    data() {
        return {
            info: {},
            rules: {
                count: { required: true, trigger: 'blur', message: '请输入发放优惠券的数量' },
                amount: { required: true, trigger: 'blur', message: '请输入优惠金额' },
                name: { required: true, trigger: 'blur', message: '请输入优惠券名称' },
                useAmount: { required: true, trigger: 'blur', message: '请输入优惠券使用门槛金额' },
                userLimitCount: { required: true, trigger: 'blur', message: '请输入最多领取张数' },
                sendTime: { required: true, trigger: 'blur', message: '请选择时间' },
                useTime: { required: true, trigger: 'blur', message: '请选择时间' }
            },
            id: '',
            isCount: false,
            isUserLimitCount: false,

            form: {
                amount: '',
                count: '-1',
                createTime: '',
                id: '',
                isShop: '0',
                merchantId: '',
                name: '',
                receiveCount: '',
                sendEndTime: '',
                sendStartTime: '',
                status: '',
                stock: '',
                type: '2',
                updateTime: '',
                useAmount: '',
                useEndTime: '',
                useStartTime: '',
                userLimitCount: '-1',
                isGroup: '0',
                isSpike: '0',
                isPro: '0',
                useTime: [],
                sendTime: []
            }
        };
    },
    created() {
        this.id = this.$route.query.id || '';
        let form = JSON.parse(localStorage.getItem('couponItem')) || {};
        if (this.id) {
            this.form = form;
            this.form.isShop = form.isShop + '';
            this.form.type = form.type + '';
            this.form.isGroup = form.isGroup + '' || '0';
            this.form.isSpike = form.isSpike + '' || '0';
            this.form.isPro = form.isPro + '' || '0';
            
            this.isCount = form.count == '-1' ? false : true;
            this.isUserLimitCount = form.userLimitCount == '-1' ? false : true;
            console.log(this.form);
            
            let useTime = [this.$common.getDate(form.useStartTime), this.$common.getDate(form.useEndTime)];
            let sendTime = [this.$common.getDate(form.sendStartTime), this.$common.getDate(form.sendEndTime)];

            this.$set(this.form, 'useTime', useTime);
            this.$set(this.form, 'sendTime', sendTime);
        }
    },
    methods: {
        add() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.load) {
                        return;
                    }
                    if(this.form.isGroup==0&&this.form.isSpike==0&&this.form.isPro==0)return this.$message.warning('使用范围必须选一个')
                    this.load = true;
                    this.$request.post({
                        url: 'mt/coupon/addAndUpdate',
                        params: {
                            amount: this.form.amount,
                            count: this.isCount ? this.form.count : -1,
                            isShop: this.form.isShop,
                            name: this.form.name,
                            type: this.form.type,
                            useAmount: this.form.useAmount,
                            sendStartTime: this.form.sendTime[0],
                            sendEndTime: this.form.sendTime[1],
                            useStartTime: this.form.useTime[0],
                            useEndTime: this.form.useTime[1],
                            userLimitCount: this.isUserLimitCount ? this.form.userLimitCount : -1,
                            id: this.form.id,
                            isGroup: this.form.isGroup,
                            isSpike: this.form.isSpike,
                            isPro: this.form.isPro
                        },
                        success: (result) => {
                            if (!this.id) this.$message.success('添加成功');
                            if (this.id) this.$message.success('修改成功');
                            // this.$router.push({
                            //     path: '/activity/list'
                            // });
                            this.$router.push('/coupon/couponList');
                        },
                        finally: () => {
                            this.load = false;
                        }
                    });
                }
            });
        }
    }
};
</script>

<style>
</style>
<style lang="scss" scoped>
.card {
    width: 800px;
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    color: #606266;
    margin: 10px 30px 0px 0px;
    & > p {
        background: #f8f8f8;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        b {
            padding-left: 10px;
            display: inline-block;
            // border-left: 5px solid #409eff;
        }
    }
}
.map_body {
    height: 300px;
}
</style>
