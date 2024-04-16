<template>
 <div>
  <el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" @close="onClose" >
   <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="105px" @keyup.enter.native="handelConfirm()">
    <!-- <el-form-item label="账户名" prop="account">
     <el-input v-model="formData.account" placeholder="请输入账户名" :minlength="6" :maxlength="15" show-word-limit clearable :style="{ width: '100%' }"></el-input>
    </el-form-item>
    <el-form-item label="余额" prop="balance" >
     <el-input v-model="formData.balance" placeholder="请输入余额" :maxlength="11" show-word-limit clearable :style="{ width: '100%' }"></el-input>
    </el-form-item> -->
	
	<el-form-item prop="phone" label="手机号">
	    <el-input v-model="formData.phone" placeholder="手机号" prefix-icon="el-icon-user"></el-input>
	</el-form-item>
	<el-form-item label="新密码" prop="password">
	    <el-input v-model="formData.password" placeholder="新密码" type="password"
	              prefix-icon="el-icon-lock"></el-input>
	</el-form-item>
	<el-form-item label="图形验证码" prop="code">
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
	<el-form-item label="手机验证码" prop="phoneCode">
	    <el-row>
	        <el-col :span="16">
	            <el-input v-model="formData.phoneCode" placeholder="验证码" prefix-icon="el-icon-lock"
	                      style="margin-right: 5px;"></el-input>
	        </el-col>
	        <el-col :span="8" class="align-right">
	            <el-button class="codebtn" v-if="smsShow" @click="getSms">获取验证码</el-button>
	            <el-button class="codebtn" v-if="!smsShow">{{getVerification}}</el-button>
	        </el-col>
	    </el-row>
	</el-form-item>
	
	<!-- <el-button type="primary" class="form_btn" @click="submitForm" :loading='loading'>确认重置</el-button> -->
	
   </el-form>
   <div slot="footer">
    <el-button @click="onClose">取消</el-button>
    <el-button type="primary" @click="handelConfirm()" :loading='loading'>确定</el-button>
   </div>
  </el-dialog>
 </div>
</template>
<script>
	import ImgCode from '@/components/utils/ImgCode'
	import rsa from '@/utils/rsa'
export default {
 inheritAttrs: false,
 components: {
	 ImgCode
 },
 props: {},
 data() {
  return {
   obdForm: {},
   formData: {
    account: undefined,
    balance: "",
   },
   isPassword: false,
   rules: {
    account: [
     {
      required: true,
      message: "请输入账户名",
      trigger: "blur",
     },
    ],
    password: [
     {
      required: true,
      message: "请输入新密码",
      trigger: "blur",
     },
     {
      max: 15,
      min: 6,
      required: true,
      message: "请输入登录密码，至少6位。",
      trigger: "blur",
     },
    ],
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
   getVerification: '60s后重新获取',
   loading: false,
  };
 },
 computed: {},
 watch: {},
 created() {},
 mounted() {},
 methods: {
	 // 获取短信验证码
	 getSms() {
	     if(!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
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
	             phone: this.formData.phone,
	             verifyCode: this.sms.code,
	             verifySign: this.sms.sign
	         },
	         success: (res) => {
	             this.formData.phoneSign = res
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
  onOpen() {},
  onClose() {
   this.isPassword = false;
   this.$refs["elForm"].resetFields();
   this.formData = {};
   this.sms= {
       codeUrl: '',
       sign: '',
       code: '',
   }
   this.$emit("update:visible", false);
  },

  handelConfirm() {
   this.$refs["elForm"].validate((valid) => {
    if (!valid) return;
    // let url = !form.id ? "admin/usInfo/add" : "admin/usInfo/update";
    // this.$request.post({
    //  url: url,
    //  params: form,
    //  success: (res) => {
    //   this.$message.success("操作成功!");
    //   this.$emit("success");
    //   this.onClose();
    //  },
    //  error: () => {},
    //  finally: () => {},
    // });
	
	this.loading = true;
	this.$request.post({
	    url: 'mt/account/public/forgetPassword',
	    params: {
	        phone: rsa.encryptByPublicKey(this.formData.phone),
	        password: rsa.encryptByPublicKey(this.formData.password),
	        phoneCode: rsa.encryptByPublicKey(this.formData.phoneCode),
	        phoneSign: this.formData.phoneSign
	    },
	    success: (res) => {
	        this.$message.success('操作成功')
	        this.$router.push('/login')
			this.$emit("success");
			this.onClose();
	    },
	    allError: (e) => {
	        this.$refs.imgCode.getImgCode();
	    },
	    finally: () => {
	        this.loading = false;
	    }
	});
   });
  },
 },
};
</script>
<style></style>