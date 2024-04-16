<template>
<div id="flow">
    <!-- -----------------------------------筛选------------------------------------ -->
    <el-form :inline="true" size="medium">
        <el-form-item>
            <el-select class="tesu" v-model="screenData.level" placeholder="请选择是否会员" style="width: 170px" clearable>
                <el-option v-for="(item) in levelList" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-select class="tesu" v-model="screenData.status" placeholder="请选择状态" style="width: 170px" clearable>
                <el-option v-for="(item) in statusList" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-input placeholder="请输入昵称" style="width: 170px" v-model="screenData.nick"/>
        </el-form-item>
        <el-form-item>
            <el-date-picker
                v-model="timeArr"
                @change="timeChange"
                type="daterange"
                style="width: 280px"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
        </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- -----------------------------------列表------------------------------------ -->
    <el-table
    :data='list'
    stripe
    v-loading='loading'
    style="width:100%">

        <el-table-column align="center" width="80" prop="id" label="ID"></el-table-column>
        
        <el-table-column align="center" prop="avatar" label="头像">
            <template slot-scope="scope">
                <el-image class="avatar" fit="cover" :src="scope.row.avatar | fullPath" :preview-src-list="[$envConfig.serviceUrl + scope.row.avatar]">
                </el-image>
            </template>
        </el-table-column>

        <el-table-column align="center" prop="nick" show-overflow-tooltip label="昵称"> </el-table-column>
        <el-table-column align="center" prop="phone" label="电话"> </el-table-column>

        <el-table-column align="center" prop="level" label="会员等级">
            <template slot-scope="scope">
                <div v-for="item in levelList" :key="item.id">
                    <el-tag v-if="scope.row.level==item.id" :type="item.type" size="small">{{item.name}}</el-tag>
                </div>
            </template>
        </el-table-column>

        <el-table-column align="center" prop="level" label="用户类型">
            <template slot-scope="scope">
                {{scope.row.isMonopoly==1? '专卖店用户':'非专卖店用户'}}
            </template>
        </el-table-column>

        <el-table-column align="center" prop="status" label="状态">
            <template slot-scope="scope">
                <div v-for="item in statusList" :key="item.id">
                    <div :class="item.colors" v-if="item.id==scope.row.status">{{item.name}}</div>
                </div>
            </template>
        </el-table-column>

        <el-table-column align="center" label="注册时间" width="110">
            <template slot-scope="scope">
                <p>{{$common.getDate(scope.row.createTime)}}</p>
            </template>
        </el-table-column>

        <el-table-column align="center" label="操作">
            <template slot-scope="scope">
                <!-- <el-button type="primary" size="mini" @click="toCancel(scope.row.id)" plain>注销</el-button> -->
                <el-button class="mybtn" type="success" size="small" v-if="scope.row.status==1" @click="toHandle(scope.row.id,-1)">冻结</el-button>
                <el-button class="mybtn" type="danger" size="small" v-if="scope.row.status==-1" @click="toHandle(scope.row.id,1)">解冻</el-button>
                <el-button class="mybtn" type="warning" size="small" v-if="scope.row.level>=3 && scope.row.isMonopoly==0" @click="setMonopoly(scope.row)">设置专卖店</el-button>
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
      :total="itemTotal">
    </el-pagination>
</div>
</template>

<script>
export default{
    data(){
        return{
            list: [],
            loading: false,
            screenData: {                //筛选参数
                level: '',
                status: '',
                nick: '',
                startTime: '',
                endTime: '',
                pageNo: 1,
                pageSize: 10,
            },
            levelList: [
                {id: 1, name: '创客', type: 'info'},
                {id: 2, name: '代理',type: 'success'},
                {id: 3, name: '总代理',type: ''},
                {id: 4, name: '合伙人',type: 'danger'},
            ],
            statusList: [
                // {id: -2, name: '已注销', colors: 'error'},
                {id: -1, name: '已冻结', colors: 'error'},
                {id: 1, name: '正常', colors: 'gray'}
            ],
            itemTotal: 0,
            timeArr: [],                //筛选时间
        }
    },

    watch: {

    },
    methods: {
         //--------------获取列表----------------------
        getList(){
            this.loading = true
            this.$request.post({
                url: 'mt/usInfo/list', 
                params: this.screenData,
                success: res =>{
                    this.list = res.list
                    this.itemTotal = res.total
                },
                finally: () => {
                    this.loading = false;
                }
            })
        },
        // 设置专卖店
        setMonopoly(obj){
            this.loading = true
            this.$request.post({
                url: 'mt/usInfo/setMonopoly',
                params: {
                    id: obj.id,
                    isMonopoly: 1
                },
                success: result=>{
                    this.$message.success('操作成功')
                    this.getList()
                },
                finally: ()=>{
                    this.loading = false;
                }
            })
        },
        

        // 冻结或解冻
        toHandle(id,type){
            if(this.loading) return;
            if(type==-1){
                this.$prompt('冻结理由', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPlaceholder: '请输入冻结理由',
                    inputPattern: /^\S+$/,
                    inputErrorMessage: '理由不能为空'
                }).then(({ value }) => {
                    this.toHandleA(id,type,value);
                }).catch(() => {});
            }else{
                this.$confirm('确定解冻该账号?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.toHandleA(id,type);
                }).catch(() => {});
            }
            
        },
        // 冻结或解冻接口
        toHandleA(id,type,reason){
            this.load = true
            this.$request.post({
                url: 'mt/usInfo/freezeOrThaw',
                params: {
                    id,
                    status: type,
                    reason
                },
                success: result=>{
                    this.$message.success('操作成功')
                    this.getList()
                },
                finally: ()=>{
                    this.loading = false
                }
            })
        },
       
        // 注销用户账号
        toCancel(id){
            this.$confirm('确定注销该账号?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.load = true
                this.$request.post({
                    url: 'mt/usInfo/cancel',
                    params: {
                        id,
                        status: 0
                    },
                    success: result=>{
                        this.$message.success('注销成功')
                        this.getList()
                    },
                    finally: ()=>{
                        this.load = false
                    }
                })
            }).catch(() => {});
            
        },

        //页面改变
        pageChange(current){
            if(current) {
                this.screenData.pageNo = current
                this.getList()
            }
        },

        //-------日期改变-----------
        timeChange(val) {
            if (val) {
                this.screenData.startTime = this.$common.getDate(val[0]);
                this.screenData.endTime = this.$common.getDay(val[1])+' 23:59:59';
            } else {
                this.screenData.startTime = '';
                this.screenData.endTime = '';
            }
        },

    },
    created(){
        this.getList()
    }
  }
</script>

<style lang="scss">
.mybtn{
    margin-top: 3px;
    margin-bottom: 3px;
}
.avatar{
    border-radius: 50%;
    width: 70px;
    height: 70px;
}
</style>
