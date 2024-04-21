
<template>
  <div id="">
    <el-button type="warning" @click="addDialog=true">新增网点</el-button>
    <el-table :data="list" v-loading="loading" stripe fixed="right">
      <el-table-column label="网点名称" prop="webPointName" align="center" width="200px"></el-table-column>
      <el-table-column label="快递公司编码" prop="courierCompany" align="center" min-width="180px">
      </el-table-column>
      <el-table-column label="快递公司名称" prop="companyName" align="center"></el-table-column>
      <el-table-column label="月结号" prop="monthCode" align="center">
        <template slot-scope="scope">
          {{ scope.row.monthCode?scope.row.monthCode:"--"}}
        </template>
      </el-table-column>
      <el-table-column label="客户编码" prop="customerName" align="center">
        <template slot-scope="scope">
          {{ scope.row.customerName?scope.row.customerName:"--"}}
        </template>
      </el-table-column>
      <el-table-column label="客户密码" prop="customerPwd" align="center">
        <template slot-scope="scope">
          {{ scope.row.customerPwd?scope.row.customerPwd:"--"}}
        </template>
      </el-table-column>
      <el-table-column label="网点编码" prop="sendSite" align="center">
        <template slot-scope="scope">
          {{ scope.row.sendSite?scope.row.sendSite:"--"}}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200px">
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="openUpdate(scope.row)">修 改</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删 除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        class="page margin_top20 align-center"
        background
        @size-change="handleSizeChange"
        @current-change="getList"
        :current-page.sync="params.pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="params.pageSize"
        :layout="$store.state.isPhone ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
        :total="total"
    >
    </el-pagination>

    <!-- 弹框 -->
    <el-dialog title="网点信息" :visible.sync="addDialog" width="520px" center @close="closeDialog" :close-on-click-modal="false">
      <el-form :model="addFrom" :rules="rule" ref="addFrom" label-width="120px">
        <el-form-item label="网点名称" prop="webPointName">
          <el-input placeholder="请输入线下网点名称" v-model="addFrom.webPointName"></el-input>
        </el-form-item>
        <el-form-item label="快递公司名称" prop="companyName">
          <el-autocomplete
              v-model="addFrom.companyName"
              :fetch-suggestions="querySearchAsync"
              placeholder="输入快递公司名称搜索"
              @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="快递公司编码" prop="courierCompany">
          <el-input placeholder="" v-model="addFrom.courierCompany" disabled></el-input>
        </el-form-item>
        <div style="color: red;margin: 20px;font-size: 12px">
          月结号、客户编码、客户密码、网点编码请根据实际网点给予的信息填写，至少填写一个
        </div>
        <el-form-item label="月结号">
          <el-input placeholder="请根据实际网点提供的月结号填写(没有可不填)" v-model="addFrom.monthCode" ></el-input>
        </el-form-item>
        <el-form-item label="客户编码">
          <el-input placeholder="请根据实际网点提供的客户编码填写(没有可不填)" v-model="addFrom.customerName" ></el-input>
        </el-form-item>
        <el-form-item label="客户密码">
          <el-input placeholder="请根据实际网点提供的客户密码填写(没有可不填)" v-model="addFrom.customerPwd"></el-input>
        </el-form-item>
        <el-form-item label="网点编码">
          <el-input placeholder="请根据实际网点提供的网点编码填写(没有可不填)" v-model="addFrom.sendSite"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="save()">确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      companyNameValid:true,
      addDialog: false,
      params: {
        pageNo: 1,
        pageSize: 10,
        isCount: true,
        type: 1,
        id: '',
      },
      list: [],
      total: 0,
      loading: false,
      addFrom: {
        webPointName: "",
        companyName: "",
        courierCompany: "",
        monthCode: "",
        customerName: "",
        customerPwd: "",
        sendSite: ""
      },
      //订单发货
      deliveryData: {
        id: '',
        express: '',
        expressNum: ''
      },
      rule: {
        webPointName: {
          message: '请输入网点名称',
          required: true,

        },
        companyName: {
          message: '请选择快递公司',
          required: true,

        },
        courierCompany: {
          message: '请选择快递公司，将自动补全编码',
          required: true,

        }
      },

      statusList: [
        {id: 0, name: '待支付'},
        {id: 1, name: '待使用'},
        {id: 10, name: '待发货'},
        {id: 11, name: '待收货'},
        {id: 2, name: '待评价'},
        {id: 3, name: '已评价'},
        {id: -1, name: '已退款'},
        {id: -2, name: '已取消'}
      ],
      typeList: [
        {id: 1, name: '普通商品'},
        {id: 2, name: '秒杀商品'},
        {id: 3, name: '团购商品'}
      ]
    };
  },
  watch: {},
  created() {
  },
  mounted() {
    this.getList(1);
  },

  methods: {
    remove(id){
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post({
          url: '/mt/dotCode/remove',
          params: {id:id},
          success: (result) => {
            this.$message.success(result)
            this.search()
          },
        });
      })
    },
    openUpdate(row){
      this.addDialog=true
      this.addFrom=JSON.parse(JSON.stringify(row))
    },
    save(){
      this.$refs['addFrom'].validate((valid) => {
        if(!valid){
          return ;
        }
        if(!this.addFrom.monthCode&&!this.addFrom.customerName&&!this.addFrom.customerPwd){
          this.$message.warning(" 月结号、客户编码、客户密码请根据实际网点给予的信息填写，至少填写一个")
          return;
        }
        if(this.companyNameValid){
          this.$message.warning("快递公司名称错误，请检查后重新选择")
          return ;
        }
        console.log("addFrom:",this.addFrom)
        this.$request.post({
          url: !this.addFrom.id?'/mt/dotCode/add':"/mt/dotCode/edit",
          params: this.addFrom,
          success: (result) => {
            this.$message.success(result)
            this.addDialog=false
            this.closeDialog();
            this.search()
          },
        });
      })
    },
    handleSelect(item) {
      console.log("item:", item)
      this.addFrom.courierCompany = item.courierCompany
    },
    querySearchAsync(queryString, cb) {
      if (!queryString) {
        queryString = "顺丰"
      }
      this.$request.post({
        url: '/merchant/public/queryLikeByName',
        params: {keyword: queryString},
        success: (result) => {
          if(result.length===0){
            this.companyNameValid=true
          }else {
            this.companyNameValid=false
          }
          var newArray = result.map((item) => {
            return {"value": item.courierCompany, "courierCompany": item.companyNumber};
          });
          cb(newArray)
        },
      });

      // setTimeout(()=>{cb(a);},3000)


    },
    // 重置
    reset() {
      (this.params = {
        pageNo: 1,
        pageSize: 10,
        isCount: true,
        type: 1,
        id: '',
        status: '',
        userName: ''
      }),
          this.getList(1);
    },
    // 查看详情
    goDetail(id) {
      this.$router.push({
        path: '/order/orderDetail',
        query: {
          id: id
        }
      });
    },
    // 点击tap
    clicktapItem() {
      this.search();
    },
    // 关闭 弹窗后
    closeDialog() {
      this.addFrom = {
        webPointName: "",
        companyName: "",
        courierCompany: "",
        monthCode: "",
        customerName: "",
        customerPwd: "",
        sendSite: ""
      }
      this.companyNameValid=false
    },
    handleSizeChange(value) {
      this.params.pageSize = value;
      this.search();
    },
    search() {
      this.params.pageNo = 1;
      this.params.isCount = true;
      this.getList(1);
    },
    //获取列表
    getList(pageNo) {
      this.loading = true;
      this.params.pageNo = pageNo;
      this.$request.post({
        url: '/mt/dotCode/list',
        params: this.params,
        success: (result) => {
          this.list = result.list;
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

    // 发货操作
    doDelivery() {
      this.$refs['refDelivery'].validate((valid) => {
        if (valid) {
          if (this.loading) {
            return;
          }
          this.loading = true;
          this.$request.post({
            url: 'mt/order/delivery',
            params: this.deliveryData,
            success: (res) => {
              this.$store.dispatch('routes/getRemind', 1);
              this.$message.success('订单发货成功');
              this.getList(1);
              this.deliveryShow = false;
              this.$bus.$emit('refreshOrder'); //刷新 new订单
            },
            finally: () => {
              this.loading = false;
            }
          });
        }
      });
    },

    // 不同状态颜色
    statusStr(status) {
      let name = '-';
      this.statusList.forEach((item) => {
        if (item.id == status) {
          name = item.name;
        }
      });
      let statusClass = '';
      if (status == -1) {
        statusClass = 'error';
      }
      if (status == 1 || status == 10 || status == 11) {
        statusClass = 'warning';
      }
      if (status == 3 || status == 5) {
        statusClass = 'success';
      }
      if (status == 2 || status == 0) {
        statusClass = 'primarys';
      }
      return {class: statusClass, name};
    }
  },

  beforeDestroy() {
  }
};
</script>

<style>
</style>

<style lang="scss" scoped>
.page {
  text-align: right;
  margin-top: 20px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}

.primarys {
  color: rgb(0, 155, 216);
}
</style>