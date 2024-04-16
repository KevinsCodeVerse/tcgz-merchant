<template>
    <div>
        <div class="card">
            <div style="margin-top: 20px">
                <el-form ref="form" :rules="rules" label-width="300px" :inline="false" size="normal" :label-position="$store.state.isPhone ? 'top' : ''">
                    <el-form-item label="">
                        <!-- <el-radio-group v-model="list.isCheck">
                            <el-radio-button label="1">是</el-radio-button>
                            <el-radio-button label="0">否</el-radio-button>
                        </el-radio-group> -->

                        <el-button type="primary" style="float: right; margin-right: 20px" size="small" @click="btn">保存</el-button>
                        <el-button type="warning" style="float: right; margin-right: 20px" size="small" @click="getList">重置</el-button>
                        <el-button type="success" style="float: right" size="small" @click="updata">修改</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <div class="card">
            <p>
                <b>普通会员</b>
            </p>
            <div style="margin-top: 20px">
                <el-form ref="form" :rules="rules" label-width="300px" :inline="false" size="normal" :label-position="$store.state.isPhone ? 'top' : ''">
                    <el-form-item label="普通会员获得的佣金(直推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.userDirect"></el-input>
                    </el-form-item>
                    <el-form-item label="普通会员获得的佣金(间推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.userIndirect"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>


        <div class="card ">
            <p class="hj">
                <b>黄金会员</b>
            </p>
            <div style="margin-top: 20px">
                <el-form ref="form" :rules="rules" label-width="300px" :inline="false" size="normal" :label-position="$store.state.isPhone ? 'top' : ''">
                    <el-form-item label="黄金会员升级条件(个人业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.goldPerson" width="200px"></el-input>
                    </el-form-item>
                    <el-form-item label="黄金会员升级条件(团队业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.goldTeam"></el-input>
                    </el-form-item>
                    <el-form-item label="黄金会员获得的佣金(直推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.goldDirect"></el-input>
                    </el-form-item>
                    <el-form-item label="黄金会员获得的佣金(间推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.goldIndirect"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <div class="card ">
            <p class="hh">
                <b>合伙人</b>
            </p>

            <div style="margin-top: 20px">
                <el-form ref="form" :rules="rules" label-width="300px" :inline="false" size="normal" :label-position="$store.state.isPhone ? 'top' : ''">
                    <el-form-item label="合伙人升级条件(个人业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.partnerPerson" width="200px"></el-input>
                    </el-form-item>
                    <el-form-item label="合伙人升级条件(团队业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.partnerTeam"></el-input>
                    </el-form-item>
                    <el-form-item label="合伙人获得的佣金(直推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.partnerDirect"></el-input>
                    </el-form-item>
                    <el-form-item label="合伙人获得的佣金(间推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.partnerIndirect"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <div class="card ">
            <p class="zz"> 
                <b>至尊合伙人</b>
            </p>

            <div style="margin-top: 20px">
                <el-form ref="form" :rules="rules" label-width="300px" :inline="false" size="normal" :label-position="$store.state.isPhone ? 'top' : ''">
                    <el-form-item label="至尊合伙人升级条件(个人业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.superPartnerPerson" width="200px"></el-input>
                    </el-form-item>
                    <el-form-item label="至尊合伙人升级条件(团队业绩)：">
                        <el-input :disabled="isUpdata" v-model="list.superPartnerTeam"></el-input>
                    </el-form-item>
                    <el-form-item label="至尊合伙人获得的佣金(直推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.superPartnerDirect"></el-input>
                    </el-form-item>
                    <el-form-item label="至尊合伙人获得的佣金(间推)单位%：">
                        <el-input :disabled="isUpdata" v-model="list.superPartnerIndirect"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            list: {},
            rules: {},
            isUpdata: true
        };
    },

    watch: {},

    mounted() {
        this.getList();
    },

    methods: {
        // 修改
        updata() {
            this.isUpdata = false;
        },
        // 保存
        btn() {
            this.$confirm('保存为最新配置, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success'
            })
                .then(() => {
                    this.$request.post({
                        url: '/mt/invite/setConfig',
                        params: this.list,
                        success: (result) => {
                            this.isUpdata = true;
                            this.$message.success('修改成功');
                        },
                        finally: () => {}
                    });
                })
                .catch((err) => {
                    return err;
                });
        },
        // 请求 list
        getList() {
            this.$request.post({
                url: '/mt/invite/configList',
                success: (result) => {
                    this.list = result || {};
                    console.log(result);
                    this.isUpdata = true;
                },
                finally: () => {}
            });
        }
    }
};
</script>

<style></style>

<style scoped>
.select {
    margin-right: 15px;
    margin-left: 15px;
}
.card {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    color: #606266;
    margin-bottom: 30px;
    margin-top: 10px;
}

.card > p {
    background: #f8f8f8;
    padding: 10px;
    display: flex;
    padding-left: 20px;

    justify-content: space-between;
    align-items: center;
}
.card > p b {
    padding-left: 10px;
    display: inline-block;
    border-left: 5px solid #409eff;
    padding: 5px 10px;
}

.el-input {
    width: 300px;
}

.hh{
    
    color: rgb(232,82,82);
    /* text-shadow: 1px 2px 3px rgba(24, 24, 24, 0.459) ; */
}
.zz{
      color: rgb(183,125,225);
    /* text-shadow: 2px 2px 3px rgba(24, 24, 24, 0.404) ; */
}
.hj{
    
    color: rgb(255, 251, 0);
    text-shadow: 2px 2px 2px rgba(24, 24, 24, 0.199) ;
}
</style>
