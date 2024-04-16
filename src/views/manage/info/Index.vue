<template>
    <div id="info_index">
        <div class="form_body">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="头像">
                    <upload ref="avatar" :limit_size="1" />
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="手机号码">
                    <el-input v-model="form.phone" placeholder="请输入手机号码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">确认修改</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import upload from '@/components/upload/Upload'
export default {
    name: '',
    components: {
        upload
    },
    data() {
        return {
            form: {}
        }
    },
    created(){
        
    },
    mounted(){
        this.getDetail();
    },
    watch: {},
    methods: {
        getDetail() {
            this.$request.post({
                url: "/mt/info/info",
                success: (result) => {
                    console.log(result)
                    // this.form = result;
                    // delete this.form.createTime;
                    // delete this.form.status;
                    // delete this.form.updateTime;
                    // if(this.form.avatar) {
                    //     this.$refs.avatar.path_list.push({
                    //         path: this.form.avatar
                    //     })
                    // }
                    // if(this.form.banner) {
                    //     this.$refs.poster.path_list.push({
                    //         path: this.form.banner
                    //     })
                    // }
                    // this.TencentMap();
                }
            });
        },
        onSubmit() {
            var avatar = this.$refs.avatar.path_list[0];
            if(!avatar) {
                this.$message.warning('请上传头像');
                return;
            } else {
                this.form.avatar = avatar.path;
            }
            if(!this.form.name) {
                this.$message.warning('请填写姓名');
                return;
            }
            if(!this.form.phone) {
                this.$message.warning('请填写手机号码');
                return;
            }
            if(this.loading) return;
            this.loading = true;
            this.$request.post({
                 url: "fm/info/updateInfo",
                 params: this.form,
                 success: (result) => {
                     this.$message.success('操作成功');
                 },
                 finally: () => {
                      this.loading = false;
                 },
            });
        }
    }
}
</script>

<style>
.el-form-item__content {
    font-size: 16px !important;
    color: #666666;
}
</style>

<style lang="scss" scoped>
#info_index {
    .form_body {
        width: 80%;
    }
    .avatar {
        width: 120px;
        height: 120px;
        display: block;
        border-radius: 50%;
    }
    .poster {
        height: 120px;
        display: block;
    }
    .map_body {
        width: 80%;
        height: 300px;
        margin-top: 15px;
    }
}
</style>