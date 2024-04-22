<template>
  <div id="">
    <el-tabs v-model="tabStatus" @tab-click="clicktapItem()">
      <el-tab-pane label="全部" name="-10"></el-tab-pane>
      <el-tab-pane v-for="item in statusList" :label="item.name" :name="item.id.toString()" :key="item.id"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true" size="medium">
      <el-form-item>
        <el-input placeholder="请输入订单编号" v-model="params.id" clearable></el-input>
      </el-form-item>
      <!-- <el-form-item>
          <el-input placeholder="请输入联系人姓名" v-model="params.userName" clearable></el-input>
      </el-form-item> -->
      <!-- <el-form-item>
          <el-select v-model="params.type" placeholder="请选择类型" clearable>
              <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-date-picker v-model="selectData" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" clearable
                        @change="search">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="warning" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" stripe fixed="right">
      <el-table-column label="订单编号" prop="id" align="center"></el-table-column>
      <el-table-column label="产品信息" prop="proId" align="center" min-width="180px">
        <template slot-scope="scope">
          <img class="avatar" :src="scope.row.proInfo.avatar | fullPath" alt=""/>
          <p>{{ scope.row.proInfo.title }}</p>
          <p v-if="scope.row.proInfo.specName">{{ scope.row.proInfo.specName }}</p>
          <p>单价：{{ scope.row.proInfo.unitPrice }}</p>
          <p>数量：{{ scope.row.count }}</p>
        </template>
      </el-table-column>
      <el-table-column label="订单总额" prop="totalAmount" align="center"></el-table-column>
      <el-table-column label="支付金额" prop="payAmount" align="center"></el-table-column>
      <el-table-column label="联系手机号" prop="phone" align="center"></el-table-column>
      <el-table-column label="配送方式" align="center">
        <template slot-scope="scope">
          <el-tag type="info" size="mini" v-if="scope.row.carriage == 1">自提</el-tag>
          <el-tag type="success" size="mini" v-else>快递</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="快递单状态" prop="shippingState" align="center">
        <template slot-scope="scope">
          {{ getShippingState(scope.row.shippingState) }}
        </template>
      </el-table-column>
      <el-table-column label="邮费" align="center">
        <template slot-scope="scope">
          <span size="mini" v-if="scope.row.freight&&scope.row.carriage==2">￥{{ scope.row.freight }}</span>
          <span type="success" size="mini" v-else>包邮</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center">
        <template slot-scope="scope">
          <span :class="statusStr(scope.row.status).class">{{ statusStr(scope.row.status).name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户备注" prop="userRemark" show-overflow-tooltip align="center"></el-table-column>

      <el-table-column label="支付时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.payTime ? $moment(scope.row.payTime).format('Y-MM-DD HH:mm') : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button class="mybtn" type="primary" size="small" @click="goDetail(scope.row.id)">详情</el-button>
          <el-button size="small" type="success" v-if="scope.row.status == 10"
                     @click="(deliveryData.id = scope.row.id), (deliveryShow = true)">发货
          </el-button>
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
    <el-dialog title="发货" :visible.sync="deliveryShow" width="520px" center @close="closeDialog">
      <el-form :model="deliveryData" :rules="deliveryRules" ref="refDelivery" label-width="120px">
        <el-form-item label="物流公司名称" prop="express">
          <el-input placeholder="请输入物流公司名称" v-model="deliveryData.express"></el-input>
        </el-form-item>

        <el-form-item label="物流单号" prop="expressNum">
          <el-input placeholder="请输入物流单号" v-model="deliveryData.expressNum"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="deliveryShow = false">取 消</el-button>
                <el-button type="primary" @click="doDelivery()">确 定</el-button>
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
        type: 1,
        id: '',
        status: '',
        userName: ''
      },
      tabStatus: '-10',
      list: [],
      total: 0,
      loading: false,
      selectData: [],
      deliveryShow: false, // 发货弹框
      // 订单发货
      deliveryData: {
        id: '',
        express: '',
        expressNum: ''
      },
      deliveryRules: {
        express: {
          message: '请输入物流公司名称',
          required: true,
          tirgger: 'blur'
        },
        expressNum: {
          message: '请输入物流单号',
          required: true,
          tirgger: 'blur'
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
    getShippingState(state) {
      switch (state) {
        case 0:
          return "暂无轨迹信息";
        case 1:
          return "已揽收";
        case 2:
          return "在途中";
        case 3:
          return "签收";
        case 4:
          return "问题件";
        case 5:
          return "转寄";
        case 6:
          return "清关";
        case -1:
          return "未打单"
        default:
          return "状态异常"
      }
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
      this.deliveryData = {
        id: '',
        express: '',
        expressNum: ''
      };
    },
    handleSizeChange(value) {
      this.params.pageSize = value;
      this.search();
    },
    search() {
      this.params.pageNo = 1;
      this.params.isCount = true;
      if (this.selectData != undefined && this.selectData && this.selectData.length) {
        this.params.startTime = this.$moment(this.selectData[0]).format('Y-MM-DD HH:mm:ss');
        this.params.endTime = this.$moment(this.selectData[1]).add(1, 'days').format('Y-MM-DD HH:mm:ss');
      } else {
        this.params.startTime = '';
        this.params.endTime = '';
        this.selectData = [];
      }
      this.getList(1);
    },
    //获取列表
    getList(pageNo) {
      this.loading = true;
      this.params.pageNo = pageNo;
      this.params.status = this.tabStatus == -10 ? '' : this.tabStatus;
      this.$request.post({
        url: '/mt/order/list',
        params: this.params,
        success: (result) => {
          for (var item of result.list) {
            if (item.proInfo) item.proInfo = JSON.parse(item.proInfo);
          }
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