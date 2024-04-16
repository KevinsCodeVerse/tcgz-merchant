// 分销员审核页面 已废弃 AuditList
<template>
    <div id="user_promoter_aduit_list">
        <!-- -----------------------------------筛选------------------------------------ -->
        <el-form :inline="true" size="medium">
            <el-form-item>
                <el-select placeholder="分销员类型" v-model="screenData.isInside" clearable>
                    <el-option value="" label="全部分销员"></el-option>
                    <el-option value="1" label="内部人员"></el-option>
                    <el-option value="0" label="普通人员"></el-option>
                </el-select>
            </el-form-item>
            <!-- <el-form-item>
                <el-select placeholder="状态" v-model="screenData.status" clearable>
                   <el-option value="1" label="正常"></el-option>
                    <el-option value="-2" label="取消资格"></el-option>
                </el-select>
            </el-form-item> -->

            <el-form-item>
                <el-input placeholder="手机号搜索" clearable v-model="screenData.mobile" @keyup.enter.native="search"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input placeholder="用户名称" clearable v-model="screenData.nick" @keyup.enter.native="search"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="warning" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- -----------------------------------列表------------------------------------ -->
        <el-table :data="list" stripe v-loading="loading" style="width: 100%">
            <el-table-column align="center" width="80" prop="id" label="ID"></el-table-column>
            <el-table-column align="center" prop="shopName" label="申请者">
                <template slot-scope="scope">
                    <el-image
                        fit="cover"
                        style="width: 60px; height: 60px"
                        :src="scope.row.userInfoList[0].avatar"
                        :preview-src-list="[scope.row.userInfoList[0].avatar]"
                    ></el-image>
                    <p>{{ scope.row.userInfoList[0].nick }}</p>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="realName" label="真实姓名"> </el-table-column>
            <!-- <el-table-column align="center" prop="grade" label="分销员等级" width="120px">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.grade==0" type="info" size="normal" > 普通分销员</el-tag>
                    <el-tag v-else-if="scope.row.grade==1" type="warning" size="normal" > 白银销员</el-tag>
                    <el-tag v-else-if="scope.row.grade==2" type="success" size="normal" >青铜销员</el-tag>
                </template>
            </el-table-column> -->
            <!-- <el-table-column align="center" prop="inviteUser" label="邀请用户量" width="120px">
                <template slot-scope="scope">
                    <el-tag type="warning" size="normal" effect="dark">{{ scope.row.inviteUser }} 名</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="inviteAgent" label="成功邀请">
                <template slot-scope="scope">
                    <el-tag type="success" size="normal" effect="dark">{{ scope.row.inviteAgent }} 名</el-tag>
                </template>
            </el-table-column> -->
            <!-- <el-table-column align="center" prop="realName" label="累积佣金">
                <template slot-scope="scope">
                    <span class="error">￥{{scope.row.amount}}</span>
                </template>
            </el-table-column> -->

            <el-table-column align="center" prop="userInfoList[0].account" label="账号"> </el-table-column>
            <el-table-column align="center" prop="userInfoList[0].mobile" label="手机号"> </el-table-column>
            <el-table-column align="center" prop="agentNick" label="邀请人">
                <template slot-scope="scope">
                    {{ scope.row.agentNick ? scope.row.agentNick : '- -' }}
                </template>
            </el-table-column>
            <el-table-column label="申请时间" align="center">
                <template slot-scope="scope">
                    {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="isInside" label="类型">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="!scope.row.isInside == 1">普通用户</el-tag>
                    <el-tag type="warning" v-else>内部人员</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                    <!-- <span v-if="scope.row.status==0" class="warning">正在审核中</span>
                 <span v-if="scope.row.status==1" class="success">通过审核</span>
                 <span v-else class="error">{{scope.row.reason}}</span> -->
                    <span class="success" v-if="scope.row.status == 1">正常</span>
                    <span class="warning" v-else-if="scope.row.status == 0">待审核</span>
                    <span class="error" v-else-if="scope.row.status == -1">不通过</span>
                    <span class="error" v-else-if="scope.row.status == 2">取消资格</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="150px">
                <template slot-scope="scope">
                    <el-button class="mybtn" type="primary" size="mini" @click="biaoshi(scope.row)">标识修改</el-button>
                    <!-- <el-button v-if="scope.row.status != 2" class="mybtn" type="warning" size="mini" @click="call(scope.row)">取消资格</el-button>
                    <el-button v-if="scope.row.status == 2" class="mybtn" type="success" size="mini" @click="regain(scope.row)">恢复资格</el-button> -->
                    
                    <el-button class="mybtn" type="success" size="mini" v-if="scope.row.status == 0" @click="updateStatus(scope.row.id, 1)">通过审核</el-button>
                    <el-button class="mybtn" type="danger" size="mini" v-if="scope.row.status == 0" @click="updateStatus(scope.row.id, -1)">不通过</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页功能 -->
        <el-pagination
            class="margin_top20 align-right"
            background
            @current-change="pageChange"
            :current-page.sync="screenData.pageNo"
            :page-size="10"
            layout="total, prev, pager, next, jumper"
            :total="itemTotal"
        >
        </el-pagination>
        <el-dialog title="添加标识" :visible.sync="show" width="30%" @close="(show = false), (form = {realName:'',isInside:0 })">
            <el-form :model="form" ref="form" :rules="rules" label-width="80px" :inline="false" size="normal">
                <el-form-item label="真实姓名">
                    <el-input v-model="form.realName"></el-input>
                </el-form-item>
                <el-form-item label="内部人员">
                    <el-radio v-model="form.isInside" :label="1">是</el-radio>
                    <el-radio v-model="form.isInside" :label="0">否</el-radio>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="show = false">取消</el-button>
                <el-button type="primary" @click="identification">确认</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rules: {},
            selectData: '',
            show: false,
            form: {
                isInside:0,
                realName:"",
            },
            list: [], //数据
            loading: false,
            screenData: {
                usType: '', //筛选参数
                status: '',
                pageNo: 1,
                pageSize: 10,
                isInside:""
            },
            itemTotal: 0
        };
    },

    watch: {},
    methods: {
        //--------------获取列表----------------------
        getList(pageNo) {
            this.loading = true;
            this.screenData.pageNo = pageNo || this.screenData.pageNo;
            this.$request.post({
                url: '/mt/invite/checkInviteList',
                params: this.screenData,
                success: (res) => {
                    this.list = res.list;
                    this.itemTotal = res.total;
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },
        // 重置
        reset() {
            this.screenData = {
                //筛选参数
                pageNo: 1,
                pageSize: 10,
                startTime: '',
                isInside: '',
                status: '',
                endTime: ''
            };
            this.getList();
        },
        // 搜索
        search() {
            this.screenData.pageNo = 1;
            this.screenData.isCount = true;
            if (this.selectData && this.selectData.length) {
                this.screenData.startTime = this.$moment(this.selectData[0]).format('Y-MM-DD HH:mm:ss');
                this.screenData.endTime = this.$moment(this.selectData[1]).add(1, 'days').format('Y-MM-DD HH:mm:ss');
            } else {
                this.screenData.startTime = '';
                this.screenData.endTime = '';
                this.selectData = [];
            }
            this.getList(1);
        },
        // 取消分销员
        call(row) {
            this.$confirm('此操作将取消资格, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            })
                .then(() => {
                    this.$request.post({
                        url: '/mt/invite/cancelInvite',
                        params: {
                            id: row.id
                        },
                        success: (res) => {
                            this.$message.success('操作成功');
                            this.getList(this.screenData.pageNo);
                        }
                    });
                })
                .catch((err) => {
                    return err;
                });
        },
        // 恢复
        regain(row) {
            this.$request.post({
                url: '/mt/invite/setInvite',
                params: {
                    id: row.id
                },
                success: (res) => {
                    this.$message.success('操作成功');
                    this.getList(this.screenData.pageNo);
                }
            });
        },
        // 标识
        biaoshi(row) {
            this.form.id = row.id;
            this.show = true;
            this.form.isInside = row.isInside;
            this.form.realName = row.realName;
        },
        //页面改变
        pageChange(current) {
            if (current) {
                this.screenData.pageNo = current;
                this.getList(this.screenData.pageNo);
            }
        },
        //
        identification() {
            this.$request.post({
                url: '/mt/invite/markInvite',
                params: {
                    id: this.form.id,
                    isInside: this.form.isInside,
                    realName: this.form.realName
                },
                success: () => {
                    this.getList();
                    this.show = false;
                },
                finally: () => {}
            });
        },
        //审核状态
        updateStatus(id, status) {
            if (status == -1) {
                this.$prompt('请输入失败原因', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                })
                    .then(({ value }) => {
                        if (!value) {
                            this.$message.error('失败原因不能为空');
                            return;
                        }
                        this.$request.post({
                            url: 'mt/invite/checkInvite',
                            params: {
                                id: id,
                                status: status,
                                remark: value
                            },
                            success: (res) => {
                                this.$message.success('操作成功');
                                this.getList(this.screenData.pageNo);
                            }
                        });
                    })
                    .catch(() => {
                        this.$message.warning('取消操作');
                    });
                //成功
            } else {
                this.$confirm('此操作将通过审核, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success'
                })
                    .then(() => {
                        this.$request.post({
                            url: 'mt/invite/checkInvite',
                            params: {
                                id: id,
                                status: status
                            },
                            success: (res) => {
                                this.$message.success('操作成功');
                                this.getList(this.screenData.pageNo);
                            }
                        });
                    })
                    .catch(() => {
                        this.$message.warning('取消操作');
                    });
            }
        }
    },
    created() {
        this.getList(1);
    }
};
</script>

<style scoped>
.mybtn {
    margin: 3px 10px;
}
.avatar {
    border-radius: 50%;
    width: 70px;
    height: 70px;
}
</style>
