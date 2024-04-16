<template>
    <div id="login">
        <div v-if="!$store.state.isPhone" class="back_img">
            <div class="shade">
                <div class="title">商户端</div>
            </div>
        </div>
        <div class="form">
            <el-form :model="params" status-icon :rules="rules" ref="login" :hide-required-asterisk="true"
                     @keyup.enter.native="submitForm()">
                <div class="form_title">重 置 密 码</div>
                <el-form-item prop="phone">
                    <el-input v-model="params.phone" placeholder="手机号" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="params.password" placeholder="密码" type="password"
                              prefix-icon="el-icon-lock"></el-input>
                </el-form-item>
                <el-form-item prop="code">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="sms.code" placeholder="验证码" prefix-icon="el-icon-lock"
                                      style="margin-right: 5px;"></el-input>
                        </el-col>
                        <el-col :span="8" class="align-right">
                            <ImgCode :sign.sync="sms.sign" ref="imgCode"
                                     style="width: 90%; height: 39px; margin-left: 10%;"/>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item prop="phoneCode">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="params.phoneCode" placeholder="验证码" prefix-icon="el-icon-lock"
                                      style="margin-right: 5px;"></el-input>
                        </el-col>
                        <el-col :span="8" class="align-right">
                            <el-button class="codebtn" v-if="smsShow" @click="getSms">获取验证码</el-button>
                            <el-button class="codebtn" v-if="!smsShow">{{getVerification}}</el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
                <div class="forget">
                    <el-button type="text" @click="$router.push('/login')">返回登录</el-button>
                </div>
                <el-button type="primary" class="form_btn" @click="submitForm" :loading='loading'>确认重置</el-button>
            </el-form>
        </div>
    </div>
</template>

<script>
import ImgCode from '@/components/utils/ImgCode'
import rsa from '@/utils/rsa'
import routerUtil from '@/router/routerUtil'

export default {
    components: {
        ImgCode
    },

    data() {
        return {
            logo: require('@/assets/img/logo.png'),
            params: {
                phone: '',
                password: '',
                phoneCode: '',
                phoneSign: '',
            },
            rules: {
                phone: [{
                    required: true,
                    message: '请输入手机号',
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                }],
                phoneCode: [{
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                }]
            },
            sms: {
                codeUrl: '',
                sign: '',
                code: '',
            },
            loading: false,
            smsShow: true,
            getVerification: '60s后重新获取'
        }
    },

    mounted() {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem("menuList");
    },

    methods: {
        submitForm() {
            this.$refs['login'].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.$request.post({
                        url: 'mt/account/public/forgetPassword',
                        params: {
                            phone: rsa.encryptByPublicKey(this.params.phone),
                            password: rsa.encryptByPublicKey(this.params.password),
                            phoneCode: rsa.encryptByPublicKey(this.params.phoneCode),
                            phoneSign: this.params.phoneSign
                        },
                        success: (res) => {
                            this.$message.success('重置成功')
                            this.$router.push('/login')
                        },
                        allError: (e) => {
                            this.$refs.imgCode.getImgCode();
                        },
                        finally: () => {
                            this.loading = false;
                        }
                    });
                } else {
                    return false;
                }
            });
        },

        resetForm() {
            this.$refs['login'].resetFields();
        },

        // 获取短信验证码
        getSms() {
            if(!/^1[3-9]\d{9}$/.test(this.params.phone)) {
                this.$message.error('手机号格式错误')
                return;
            }
            if(!this.sms.code) {
                this.$message.error('请填写图片验证码')
                return;
            }
            this.$request.post({
                url: 'sms/public/sendCode',
                params: {
                    phone: this.params.phone,
                    verifyCode: this.sms.code,
                    verifySign: this.sms.sign
                },
                success: (res) => {
                    this.params.phoneSign = res
                    this.$message.success('短信发送成功')
                    var time = 60;
                    this.smsShow= false
                    this.getVerification= '60s后重新获取'
                    var Time = setInterval(() => {
                    if(time == 1){
                        this.smsShow= true
                        time = 60;
                        clearTimeout(Time);
                    }else{
                        time -- ;
                        this.getVerification= time + 's后重新获取'
                    }
                    },1000);
                },
                allError: (e) => {
                    this.$refs.imgCode.getImgCode();
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },


        getMenus() {
            this.loading = true;
            this.$request.post({
                url: 'admin/roleMenu/getMenuUrl',
                success: (res) => {
                    sessionStorage.setItem("menuList", res);
                    let redirect = decodeURIComponent(this.$route.query.redirect || '/');
                    if (redirect.indexOf('/') != -1 || redirect.indexOf('login') != -1) {
                        redirect = '/manage/welcome';
                    }
                    localStorage.setItem('account', this.admin.account);
                    this.$router.replace(redirect);
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },

    },

}
</script>

<style scoped>
#login {
    display: flex;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    min-width: 1200px;
    background: white;
}

#login > div {
    width: 100%;
    height: 100%;
}

#login .form {
    flex: 1;
    box-sizing: border-box;
}

#login .form .el-form {
    width: 80%;
    margin: auto;
    margin-top: 18vh;
}

#login .back_img {
    flex: 3;
}

#login .form_title {
    font-weight: 550;
    font-size: 20px;
    margin-bottom: 15px;
    color: #444444;
}

#login .form .form_btn {
    width: 100%;
}
#login .form .forget{
    text-align: right;
    margin-top: 30px;
}
#login .codebtn{
    width: 92%;
    font-size: 12px;
    text-align: center;
    padding: 12px 0;
}
#login .back_img {
    background: url('../assets/img/login_back.jpg') center no-repeat;
    background-size: auto 100% 100%;
    display: flex;
    align-items: center;
    /* opacity: 0.7; */
}

#login .back_img .shade {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
}

#login .back_img .title {
    font-size: 30px;
    width: 60%;
    background: white;
    margin: auto;
    margin-top: 25vh;
    padding: 2% 0;
    text-align: center;
    white-space: nowrap;
    opacity: 0.85;
}

@media screen and (max-width: 768px) {
    #login {
        width: 100%;
        min-width: auto;
    }
}
</style>
