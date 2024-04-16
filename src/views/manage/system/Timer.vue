<template>
  <div>
    <el-table :data="list" v-loading="loading">
      <el-table-column label="编号" prop="id" align="center"></el-table-column>
      <el-table-column label="执行周期" prop="cycle" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.cycle + scope.row.cycleName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1" class="success">正常运行</span>
          <span v-if="scope.row.status == -1" class="error">停止运行</span>
        </template>
      </el-table-column>
      <el-table-column label="上一次执行时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.lastTime">{{$moment(scope.row.lastTime).format('Y-MM-DD HH:mm')}}</span>
          <span v-if="!scope.row.lastTime">--</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="scope">
          <span>{{$moment(scope.row.updateTime).format('Y-MM-DD HH:mm')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{$moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center"  min-width="100px">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="setData(scope.row)">修改</el-button>
          <el-button type="primary" size="small" v-if="scope.row.status == -1" @click="setStatus(scope.row)">运行</el-button>
          <el-button type="danger" size="small" v-if="scope.row.status == 1" @click="setStatus(scope.row)">停止</el-button>
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

    <el-dialog
      center
      title="修改定时任务"
      :visible.sync="dialogVisible"
      width="530px"
    >
      <el-form :model="formData" label-width="80px" :rules="rules">
        <el-form-item label="执行周期">
          <el-row>
            <el-col :span="11">
              <el-form-item>
                <el-select v-model="formData.type" placeholder="时间类型" @change="(val)=>{formData.time = 1}">
                  <el-option label="分钟" value="1"></el-option>
                  <el-option label="小时" value="2"></el-option>
                  <el-option label="天" value="3"></el-option>
                  <el-option label="月" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="11">
              <el-input-number v-model="formData.time" :min="1" :max="59" label="请输入分钟数" v-if="formData.type == '1'"></el-input-number>
              <el-input-number v-model="formData.time" :min="1" label="请输入小时数" v-if="formData.type == '2'"></el-input-number>
              <el-input-number v-model="formData.time" :min="1" :max="31" label="请输入天数" v-if="formData.type == '3'"></el-input-number>
              <el-input-number v-model="formData.time" :min="1" label="请输入月份数" v-if="formData.type == '4'"></el-input-number>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update" :loading="updateLoading">确 定</el-button>
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
          isCount: true,
        },
        loading: false,
        updateLoading: false,
        total: 0,
        list: [],
        dialogVisible: false,
        formData: {
          type: '',
          time: '',
          remark: ''
        },
        rules: {

        }
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
        this.loading = true
        this.$request.post({
          url: 'mt/timer/list',
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

      setData(data){
        this.formData.id = data.id
        this.formData.remark = data.remark
        this.formData.time = data.cycle
        switch(data.cycleName){
          case '分钟':
            this.formData.type = '1'
            break
          case '小时':
            this.formData.type = '2'
            break
          case '天':
            this.formData.type = '3'
            break
          case '月':
            this.formData.type = '4'
            break
        }
        this.dialogVisible = true
      },


      update(){
        this.updateLoading = true
        this.$request.post({
          url: 'mt/timer/update',
          params: this.formData,
          success: result =>{
            this.$message.success('修改成功')
            this.dialogVisible = false
            this.getList(1)
          },
          finally: ()=>{
            this.updateLoading = false
          }
        })
      },

      setStatus(data){
        var status = data.status == 1 ? -1 : 1
        this.$request.post({
          url: 'mt/timer/setStatus',
          params: {
            status,
            id: data.id
          },
          success: result =>{
            this.$message.success('操作成功')
            this.getList(1)
          }
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
