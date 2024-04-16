<template>
  <div id="system_data">
    <el-form size="medium" :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="date"
          @change="getList(1)"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="backUp" :loading="backUpLoading">备份数据</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="list" v-loading="loading">
      <el-table-column label="编号" prop="id" align="center"></el-table-column>
      <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status == 1">备份成功</el-tag>
          <el-tag type="danger" v-if="scope.row.status == -1">备份失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备份时间" align="center">
        <template slot-scope="scope">
          <span>{{$moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="restore(scope.row.id)" v-if="scope.row.status == 1">回滚数据</el-button>
          <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      class="page"
      background
      :layout="$store.state.isPhone?'total, prev, pager, next':'total, sizes, prev, pager, next, jumper'"
      :page-size="params.pageSize"
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
        params: {
          pageNo: 1,
          pageSize: 10,
          isCount: true,
        },
        loading: false,
        backUpLoading: false,
        total: 0,
        list: [],
        date: []
      };
    },

    watch: {},

    mounted() {
      this.getList(1)
    },

    methods: {
      getList(pageNo){
        if(pageNo){
          this.params.pageNo = pageNo
        }
        if(this.date && this.date.length > 0){
          this.params.startTime = this.$moment(this.date[0]).format('Y-MM-DD')
          this.params.endTime = this.$moment(this.date[1]).add(1,'days').format('Y-MM-DD')
        }else{
          this.params.startTime = ''
          this.params.endTime = ''
        }
        this.loading = true
        this.$request.post({
          url: 'mt/sqlData/list',
          params: this.params,
          success: result =>{
            this.list = result.list
            if(this.params.isCount){
              this.params.isCount = false
              this.total = result.total
            }
          },
          finally: ()=>{
            this.loading = false
          }
        })
      },

      backUp(){
        if(this.backUpLoading){
          return;
        }
        this.backUpLoading = true
        this.$request.post({
          url: 'mt/sqlData/backUp',
          success: result =>{
            this.$message.success('数据备份成功')
            this.getList(1)
          },
          finally: ()=>{
            this.backUpLoading = false
          }
        })
      },

      del(id){
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$request.post({
            url: 'mt/sqlData/delete',
            params: {
              id
            },
            success: result =>{
              this.$message.success('删除成功')
              if(this.list.size < 2 && this.params.pageNo > 1){
                this.params.pageNo = this.params.pageNo - 1
              }
              this.params.isCount = true
              this.getList(this.params.pageNo)
            }
          })
        })
      },

      restore(id){
        this.$confirm('是否回滚到当前阶段数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var uid = (new Date()).getTime().toString();
          PubSub.publish('showNotify', {title: '提示', message: '数据回滚中, 请稍后...', uid})
          this.$request.post({
            url: 'mt/sqlData/retore',
            params: {
              id,
              uid
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
