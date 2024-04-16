<template>
	<div id="sys_params">
    <el-table :data="list" stripe style="width: 100%" v-loading="load">
      <el-table-column prop="id" label="id" align="center"></el-table-column>
      <el-table-column prop="name" label="参数名" align="center"></el-table-column>
      <el-table-column prop="value" label="参数值"  align="center"></el-table-column>
      <el-table-column prop="remark" label="备注"  align="center"></el-table-column>
      <el-table-column  label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{$moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="update(scope.row.id)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="page"
      background
      :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'"
      :page-size="requestParam.pageSize"
      :total="total"
      @current-change="getList"
    >
    </el-pagination>
	</div>
</template>

<script>
	export default {
		data() {
			return {
         list: [],
         load: false,
         requestParam: {
           pageSize: 10,
           pageNo: 1,
           isCount: true 
         },
         total: 0,
			};
		},

    mounted(){
      this.getList(1)
    },

	methods:{
      getList(pageNo){
        this.load = true
        this.requestParam.pageNo = pageNo
        this.$request.post({
          url: 'mt/params/list',
          params: this.requestParam,
          success: result =>{
            if(this.requestParam.isCount){
              this.total = result.total
            }
            this.requestParam.isCount = false 
            this.list = result.list
          },
          finally: ()=>{
            this.load = false
          }
        })
      },

      update(id){
        this.$prompt('请输入参数值', '修改', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S/,
          inputErrorMessage: '请输入参数值'
        }).then(({ value }) => {
          this.load = true
          this.$request.post({
            url: 'mt/params/update',
            params:{
              id,
              value
            },
            success: result=>{
              this.$message.success('更新成功')
              this.getList(this.requestParam.pageNo)
            },
            finally: ()=>{
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
  .page{
		text-align: right;
		margin-top: 20px;
	}
</style>
