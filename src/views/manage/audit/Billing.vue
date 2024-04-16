<template>
<div id="arrt">
    <!-- -----------------------------------筛选------------------------------------ -->
    <el-form :inline="true" size="medium">
        <el-form-item>
            <el-input placeholder="请输入名称" style="width: 170px" v-model="screenData.keyWord"/>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button type="primary" icon="el-icon-edit-outline" @click="$router.push('/goods/add')">添加</el-button>
        </el-form-item>
    </el-form>

    <!-- -----------------------------------列表------------------------------------ -->
    <el-table
    :data='list'
    stripe
    v-loading='loading'
    style="width:100%">
        <el-table-column align="center" prop="title" show-overflow-tooltip label="公告内容"></el-table-column>

        <!-- <el-table-column align="center" prop="details" show-overflow-tooltip label="公告内容"></el-table-column> -->

        <!-- <el-table-column align="center" prop="status" label="状态">
            <template slot-scope="scope">
                <div v-for="item in statusList">
                    <div :class="item.colors" v-if="item.id==scope.row.status">{{item.name}}</div>
                </div>
            </template>
        </el-table-column> -->

        <el-table-column align="center" label="创建时间">
            <template slot-scope="scope">
                <p>{{$common.getDate(scope.row.createTime)}}</p>
            </template>
        </el-table-column>

        <el-table-column align="center" label="操作">
            <template slot-scope="scope">
                <el-button type="warning" size="mini" @click="$router.push('/notice/detail?id='+ scope.row.id)">修改</el-button>
                <el-button class="mybtn" type="danger" size="mini" icon="el-icon-delete" @click="toCancel(scope.row.id)" circle></el-button>
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
                pageNo: 1,
                pageSize: 10,
            },
            itemTotal: 0,
            formData: {
                productId: '',
                discountPrice: '',
                name: '',
                originalPrice: '',
            },
            show: false,
            statusList: [
                {id: 0, name: '待上架', colors: 'gray'},
                {id: 1, name: '正常', colors: 'success'},
            ],
            rules: {
                name: {
                    message: '请输入名称', required: true, tirgger: 'blur'
                },
                discountPrice: {
                    message: '请输入折扣价', required: true, tirgger: 'blur'
                },
                originalPrice: {
                    message: '请输入原价', required: true, tirgger: 'blur'
                },
            },
        }
    },

    watch: {

    },
    methods: {
         //--------------获取列表----------------------
        getList(){
            this.loading = true
            this.$request.post({
                url: 'mt/sysNotice/list', 
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

        // 删除
        toCancel(id){
            this.$confirm('确定删除该类别吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.load = true
                this.$request.post({
                    url: 'mt/sysNotice/delete',
                    params: {id},
                    success: result=>{
                        this.$message.success('删除成功')
                        this.getList()
                    },
                    finally: ()=>{
                        this.load = false
                    }
                })
            }).catch(() => {});
            
        },

        // 上下架
        toShelves(type,id){
            this.$request.post({
                url: 'mt/product/statusChange', 
                params: {id},
                success: res =>{
                    this.$message.success('操作成功')
                    this.getList()
                }
            })
        },  
        
        //页面改变
        pageChange(current){
            if(current) {
                this.screenData.pageNo = current
                this.getList()
            }
        },
        closeDialog(){
            this.$refs.refContent.resetFields();
            this.formData.productId='';
        },
    },
    created(){
        // this.getList()
    }
  }
</script>

<style scoped>
.mybtn{
    margin-top: 3px;
    margin-bottom: 3px;
}
</style>


