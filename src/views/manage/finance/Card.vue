<template>
    <div id="">
        <el-form :inline="true" size="medium">
            <el-form-item>
                <el-button type="success" @click="add">新增银行卡</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="银行卡号" prop="idcard" align="center"></el-table-column>
            <el-table-column label="所属银行" prop="idcardName" align="center"></el-table-column>
            <el-table-column label="持卡人" prop="name" align="center"></el-table-column>
            <el-table-column label="持卡人电话" prop="phone" align="center"></el-table-column>
            <el-table-column label="是否默认" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.defaultIdcard == 1 ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button size="small" type="primary" @click="update(scope.row)" v-loading="loading">修改</el-button>
                    <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="添加/修改银行卡" :visible.sync="addVisible" :before-close="close" width="450px">
            <el-form :inline="true" label-width="100px">
                <el-form-item label="银行卡号">
                    <el-input v-model="addForm.idCard" placeholder="请输入银行卡号"></el-input>
                </el-form-item>
                <el-form-item label="所属银行">
                    <el-select v-model="addForm.idCardName" placeholder="请选择" @change="activeChange($event)">
                        <el-option v-for="item in banklist" :key="item.bankId" :label="item.bank" :value="item.bank"> </el-option>
                    </el-select>
                    <!-- <el-input v-model="addForm.idCardName" placeholder="请输入所属银行"></el-input> -->
                </el-form-item>
                <el-form-item label="持有人">
                    <el-input v-model="addForm.name" placeholder="请输入持有人姓名"></el-input>
                </el-form-item>
                <el-form-item label="持有人电话">
                    <el-input v-model="addForm.phone" placeholder="请输入持有人电话"></el-input>
                </el-form-item>
                <el-form-item label="是否默认">
                    <el-switch v-model="addForm.defaultIdcard" active-color="#13ce66" inactive-color="#ff4949" :inactive-value="0" :active-value="1"> </el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close">取 消</el-button>
                <el-button type="primary" @click="toAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true
            },
            list: [],
            total: 0,
            loading: false,
            selectData: [],
            addVisible: false,
            addForm: {
                defaultIdcard: 0,
                id: '',
                idCard: '',
                idCardName: '',
                name: '',
                phone: ''
            },
            banklist: [],
            active: {}
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
        this.getlistbank();
    },

    methods: {
        // 删除
        remove(id) {
            this.$confirm('是否确定删除该银行卡？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                this.$request.post({
                    url: 'mt/info/delCard',
                    params: {
                        id
                    },
                    success: (result) => {
                        this.$message.success('操作成功');
                        this.getList(this.params.pageNo);
                    },
                    finally: () => {
                        this.loading = false;
                    }
                });
            });
        },
        activeChange(e) {
            console.log(e);
            this.banklist.forEach((item) => {
                if (item.bank == e) {
                    this.active = item
                    console.log(this.active);
                }
            });
        },
        // 银行卡列表
        getlistbank() {
            this.$request.post({
                url: 'general/query/public/bankList',
                success: (res) => {
                    this.banklist = res;
                },
                error: () => {},
                finally: () => {}
            });
        },
        close() {
            this.addVisible = false;
            this.addForm = {
                defaultIdcard: 0,
                id: '',
                idCard: '',
                idCardName: '',
                name: '',
                phone: ''
            };
        },
        handleSizeChange(value) {
            this.params.pageSize = value;
            this.search();
        },
        search() {
            this.params.pageNo = 1;
            this.params.isCount = true;
            if (this.selectData && this.selectData.length) {
                this.params.startTime = this.$moment(this.selectData[0]).format('Y-MM-DD HH:mm:ss');
                this.params.endTime = this.$moment(this.selectData[1]).add(1, 'days').format('Y-MM-DD HH:mm:ss');
            } else {
                this.params.startTime = '';
                this.params.endTime = '';
                this.selectData = [];
            }
            this.getList(1);
        },
        getList(pageNo) {
            this.loading = true;
            this.params.pageNo = pageNo;
            this.$request.post({
                url: 'mt/info/getBank',
                params: this.params,
                success: (result) => {
                    this.list = result;
                    if (this.params.isCount) {
                        this.params.isCount = false;
                        this.total = result.total;
                    }
                },
                finally: () => {
                    this.loading = false;
                }
            });
        },
        add() {
            this.addVisible = true;
        },
        update(data) {
            this.addForm.id = data.id;
            this.addForm.defaultIdcard = data.defaultIdcard;
            this.addForm.idCard = data.idcard;
            this.addForm.idCardName = data.idcardName;
            this.addForm.name = data.name;
            this.addForm.phone = data.phone;
            this.addForm.bankId = data.bankId;
            this.addVisible = true;
        },
        toAdd() {
            if (this.loading) return;
            this.loading = true;
            if (!this.addForm.idCard) {
                this.loading = false;
                this.$message.warning('请输入银行卡号');
                return;
            }
            if (!this.addForm.idCardName) {
                this.loading = false;
                this.$message.warning('请选择所属银行');
                return;
            }
            if (!this.addForm.name) {
                this.loading = false;
                this.$message.warning('请输入持卡人姓名');
                return;
            }
            if (!this.addForm.phone) {
                this.loading = false;
                this.$message.warning('请输入持卡人电话');
                return;
            }
                            this.addForm.bankId = this.active.bankId||this.addForm.bankId

            this.$request.post({
                url: 'mt/info/saveOrUpdateBank',
                params: this.addForm,
                success: (result) => {
                    this.$message.success('操作成功');
                    this.addVisible = false;
                    this.getList(this.params.pageNo);
                },
                finally: () => {
                    this.loading = false;
                }
            });
        }
    },

    beforeDestroy() {}
};
</script>
   
<style>
</style>
   
<style lang="scss" scoped>
.page {
    text-align: right;
    margin-top: 20px;
}
</style>