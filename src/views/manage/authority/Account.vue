<template>
    <div id="authority_account">
        <!-- 筛选 -->
        <el-form :inline="true" class="demo-form-inline" size="medium" :disabled="load">
            <el-form-item>
                <el-select v-model="requestParam.status" placeholder="状态" @change="getList(1)">
                    <el-option value="" label="全部"></el-option>
                    <el-option value="1" label="正常"></el-option>
                    <el-option value="-1" label="已冻结"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button @click="openAddForm" type="success">添加账号</el-button>
            </el-form-item>
        </el-form>
        <!-- 表格 -->
        <el-table :data="list" stripe style="width: 100%" v-loading="load">
            <el-table-column prop="id" label="id" align="center"></el-table-column>
            <el-table-column prop="account" label="账号" width="120" align="center"></el-table-column>
            <el-table-column prop="roleName" label="角色" align="center"></el-table-column>
             <el-table-column prop="name" label="姓名" align="center"></el-table-column>
             <el-table-column prop="phone" label="电话" align="center"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 1">正常</span>
                    <span v-if="scope.row.status == -1" class="error">冻结</span>
                </template>
            </el-table-column>
            <el-table-column label="最近登录时间" align="center">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.loginTime).format('Y-MM-DD HH:mm') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="310" class-name="operation">
                <template slot-scope="scope">
                    <div v-if="scope.row.id != id ">
                        <el-button type="primary" size="small" @click="setupdateForm(scope.row)">修改</el-button>
                        <el-button type="warning" size="small" @click="freeze(scope.row.id)"
                                   v-if="scope.row.status == 1">冻结
                        </el-button>
                        <el-button size="small" @click="thaw(scope.row.id)" v-if="scope.row.status == -1">解冻</el-button>
                        <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination background :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'" :page-size="requestParam.pageSize"
                       :current-page.sync.sync="requestParam.pageNo"
                       :total="total" @current-change="getList" class="page">
        </el-pagination>

        <!-- 添加账号弹框 -->
        <el-dialog center title="添加账号" :visible.sync="addVisible" :close-on-click-modal="false" width="420px">
            <el-form ref="form" :model="addForm" label-width="100px" :rules="rules" label-position="left">
                <el-form-item label="角色" prop="roleId">
                    <el-select v-model="addForm.roleId" v-infinite-scroll="getRoleList" placeholder="请选择角色">
                        <el-option v-for="(item, index) in roleList" :key="index" :label="item.roleName"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="账号" prop="account">
                    <el-input v-model="addForm.account" placeholder="请输入账号" maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" type="password" placeholder="请输入密码" maxlength="18"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="rePassword">
                    <el-input v-model="addForm.rePassword" type="password" placeholder="请再次输入密码"
                              maxlength="18"></el-input>
                </el-form-item>
                 <el-form-item label="姓名" prop="name" >
                    <el-input v-model="addForm.name" placeholder="请输入姓名"
                              maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone" >
                    <el-input v-model="addForm.phone" placeholder="请输入电话号码"
                              maxlength="11"></el-input>
                </el-form-item>
                
                <el-form-item label="备注">
                    <el-input v-model="addForm.remark" placeholder="可在此处填写备注"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
				<el-button @click="addVisible = false">取 消</el-button>
				<el-button type="primary" @click="add">添 加</el-button>
			</span>
        </el-dialog>

        <!-- 修改账号弹框 -->
        <el-dialog center title="修改账号" :visible.sync="updateVisible" :close-on-click-modal="false" width="500px">
            <el-form ref="updateform" :model="updateForm" label-width="120px" :rules="updaterules">
                <el-form-item label="角色" prop="roleId">
                    <el-select v-model="updateForm.roleId" v-infinite-scroll="getRoleList" placeholder="请选择角色">
                        <el-option v-for="(item, index) in roleList" :key="index" :label="item.roleName"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="账号" prop="account">
                    <el-input v-model="updateForm.account" placeholder="请输入账号" maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name" >
                    <el-input v-model="updateForm.name" placeholder="请输入姓名"
                              maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="修改密码 电话?">
                    <el-radio-group v-model="isUpdPwd">
                        <el-radio label="1">不修改</el-radio>
                        <el-radio label="2">修改</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone" v-show="isUpdPwd == 2">
                    <el-input v-model="updateForm.phone" placeholder="请输入电话号码"
                              maxlength="11"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-show="isUpdPwd == 2">
                    <el-input v-model="updateForm.password" type="password" placeholder="请输入密码"
                              maxlength="18"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="rePassword" v-show="isUpdPwd == 2">
                    <el-input v-model="updateForm.rePassword" type="password" placeholder="请再次输入密码"
                              maxlength="18"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="updateForm.remark" placeholder="可在此处填写备注" maxlength="50"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
				<el-button @click="updateVisible = false">取 消</el-button>
				<el-button type="primary" @click="update">修 改</el-button>
			</span>
        </el-dialog>
    </div>
</template>

<script>
import rsa from '@/utils/rsa'

export default {
    data() {
        return {
            list: [],
            load: false,
            id:'',
            requestParam: {
                pageSize: 10,
                pageNo: 1,
                status: ''
            },
            total: 0,
            roleParam: {
                pageNo: 0,
                pageSize: 10
            },
            roleTotal: 0,
            roleList: [],
            addVisible: false,
            updateVisible: false,
            // 是否修改密码
            isUpdPwd: '1',
            storeList: [],
            // 账号表单信息
            updateForm: {
                id: -1,
                roleId: '',
                account: '',
                phone: '',
                password: '',
                rePassword: '',
                remark: '',
                name:'',
            },
            addForm: {
                id: -1,
                roleId: '',
                account: '',
                phone:'',
                password: '',
                rePassword: '',
                remark: '',
                name:'',
            },
            rules: {
                roleId: {
                    message: '请选择角色',
                    required: true
                },
                account: {
                    message: '请输入账号',
                    required: true,
                    trigger: 'blur'
                },
                name: {
                    message: '请输入姓名',
                    required: true,
                    trigger: 'blur'
                },
                phone: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        if ((this.updateVisible && this.isUpdPwd == '2' && !value) || (this.addVisible && !value)) {
                            callback(new Error('请输入电话号码'));
                        } else if ((this.updateVisible && this.isUpdPwd == '2' && value) ||  (this.addVisible && value)) {
                            //做电话号码校验
                             if(this.$common.isPhone(value))
                             {
                                 callback();
                             }else{
                                callback(new Error('电话号码格式不正确'));
                             }
                        } 
                    }
                },
                password: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        if ((this.updateVisible && this.isUpdPwd == '2' && !value) || (this.addVisible && !value)) {
                            callback(new Error('请输入密码'));
                        } else if ((this.updateVisible && this.isUpdPwd == '2' && value && (value.length < 6 || value.length > 20)) ||
                            this.addVisible && value && (value.length < 6 || value.length > 20)) {
                            callback(new Error('密码长度必须是6-20位'));
                        } else {
                            callback();
                        }
                    }
                },
                rePassword: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        if ((this.updateVisible && this.isUpdPwd == '2' && !value) || (this.addVisible && !value)) {
                            callback(new Error('请再次输入密码'));
                        } else if (this.addVisible && value !== this.addForm.password) {
                            callback(new Error('两次输入密码不一致!'));
                        } else if (this.updateVisible && value !== this.updateForm.password && this.isUpdPwd == '2') {
                            callback(new Error('两次输入密码不一致!'));
                        } else {
                            callback();
                        }
                    }
                }

            },
            updaterules: {
                roleId: {
                    message: '请选择角色',
                    required: true
                },
                account: {
                    message: '请输入账号',
                    required: true,
                    trigger: 'blur'
                },
                name: {
                    message: '请输入姓名',
                    required: true,
                    trigger: 'blur'
                },
                phone: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        console.log(value)
                        if (this.updateVisible && this.isUpdPwd == '2' && !value) {
                            callback(new Error('请输入电话号码'));
                        } else if (this.updateVisible && this.isUpdPwd == '2' && value) {
                           //做电话号码校验
                             if(this.$common.isPhone(value))
                             {
                                 callback();
                             }else{
                                callback(new Error('电话号码格式不正确'));
                             }
                        }else{
                              callback();
                        }
                    }
                },
                password: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        if ((this.updateVisible && this.isUpdPwd == '2' && !value) || (this.addVisible && !value)) {
                            callback(new Error('请输入密码'));
                        } else if ((this.updateVisible && this.isUpdPwd == '2' && value && (value.length < 6 || value.length > 20)) ||
                            this.addVisible && value && (value.length < 6 || value.length > 20)) {
                            callback(new Error('密码长度必须是6-20位'));
                        } else {
                            callback();
                        }
                    }
                },
                rePassword: {
                    required: true,
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        if ((this.updateVisible && this.isUpdPwd == '2' && !value) || (this.addVisible && !value)) {
                            callback(new Error('请再次输入密码'));
                        } else if (this.addVisible && value !== this.addForm.password) {
                            callback(new Error('两次输入密码不一致!'));
                        } else if (this.updateVisible && value !== this.updateForm.password && this.isUpdPwd == '2') {
                            callback(new Error('两次输入密码不一致!'));
                        } else {
                            callback();
                        }
                    }
                }

            }
        };
    },

    mounted() {
        this.id =sessionStorage.getItem("accountId");
        this.getList(1)
        this.getRoleList();
    },

    methods: {
        // 获取账号列表
        getList(pageNo) {
            this.load = true
            this.requestParam.pageNo = pageNo
            this.$request.post({
                url: 'mt/account/list',
                params: this.requestParam,
                success: result => {
                    this.list = result.list
                    this.total = result.total
                },
                finally: () => {
                    this.load = false
                }
            })
        },

        // 获取角色列表
        getRoleList() {
            if ((this.roleParam.pageNo * this.roleParam.pageSize >= this.roleTotal) && this.roleTotal > 0) {
                return;
            }
            this.roleParam.pageNo++
            this.$request.post({
                url: 'mt/role/list',
                params: this.roleParam,
                success: result => {
                    this.roleList = result.list
                    this.roleTotal = result.total
                },
                finally: () => {
                    this.load = false
                }
            })
        },

        // 添加
        add() {
            console.log(this.load)
            if (this.load) {
                return;
            }
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.load = true;
                    this.addVisible = false
                    this.$request.post({
                        url: 'mt/account/saveOrUpdate',
                        params: {
                            role: this.addForm.roleId,
                            account: rsa.encryptByPublicKey(this.addForm.account),
                            password: rsa.encryptByPublicKey(this.addForm.password),
                            remark: this.addForm.remark,
                            phone: this.addForm.phone,
                            name:this.addForm.name
                        },
                        success: result => {
                            this.$message.success('添加成功')
                            this.getList(1)
                        },
                        finally: () => {
                            this.load = false
                        }
                    })
                }
            })
        },

        // 打开添加窗口
        openAddForm() {
            this.reset()
            this.addVisible = true
        },

        // 重置表单信息
        reset() {
            this.addForm.roleId = ''
            this.addForm.id = ''
            this.addForm.account = ''
            this.addForm.password = ''
            this.addForm.rePassword = ''
            this.addForm.remark = ''
            this.addForm.phone = ''
            this.addForm.name=''
            var setint = setInterval(() => {
                if (this.$refs.form) {
                    this.$refs.form.resetFields()
                    this.$refs.form.clearValidate()
                    clearInterval(setint)
                }
            }, 100)
        },

        // 设置角色表单信息
        setupdateForm(data) {
            this.updateForm = {
                id: data.id,
                roleId: data.role,
                account: data.account,
                remark: data.remark,
                phone: data.phone,
                name: data.name
            }
            this.updateVisible = true
        },

        // 修改
        update() {
            if (this.load) {
                console.log('load')
                return;
            }
            this.$refs['updateform'].validate((valid) => {
                if (!valid) {
                    return;
                }
                this.updateVisible = false
                this.load = true
                this.$request.post({
                    url: 'mt/account/saveOrUpdate',
                    params: {
                        id: this.updateForm.id,
                        role: this.updateForm.roleId,
                        account: rsa.encryptByPublicKey(this.updateForm.account),
                        password: this.updateForm.password ? rsa.encryptByPublicKey(this.updateForm.password) : '',
                        remark: this.updateForm.remark,
                        phone: this.updateForm.phone,
                        name:this.updateForm.name
                    },
                    success: result => {
                        this.$message.success('修改成功')
                        this.getList(this.requestParam.pageNo)
                    },
                    finally: () => {
                        this.load = false
                    }
                })
            })
        },

        // 删除
        del(id) {
            if (this.load) {
                return;
            }
            this.$confirm('此操作将永久删除该账号, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.load = true
                this.$request.post({
                    url: 'mt/account/delete',
                    params: {
                        id
                    },
                    success: result => {
                        this.$message.success('删除成功')
                        this.getList(this.requestParam.pageNo)
                    },
                    finally: () => {
                        this.load = false
                    }
                })
            })
        },

        // 冻结
        freeze(id) {
            if (this.load) {
                return;
            }
            this.$confirm('是否冻结该账号?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.load = true
                this.$request.post({
                    url: 'mt/account/updateStatus',
                    params: {
                        id,
                        status: -1
                    },
                    success: result => {
                        this.$message.success('冻结成功')
                        this.getList(this.requestParam.pageNo)
                    },
                    finally: () => {
                        this.load = false
                    }
                })
            })
        },

        // 解冻
        thaw(id) {
            if (this.load) {
                return;
            }
            this.$confirm('是否解冻该角色?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.load = true
                this.$request.post({
                    url: 'mt/account/updateStatus',
                    params: {
                        id,
                        status: 1
                    },
                    success: result => {
                        this.$message.success('解冻成功')
                        this.getList(this.requestParam.pageNo)
                    },
                    finally: () => {
                        this.load = false
                    }
                })
            })
        }


    }

}
</script>

<style>

</style>

<style scoped>

</style>
