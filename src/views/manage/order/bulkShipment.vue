<template>
  <div id="" v-loading="reqFlag">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>公共参数</span>
      </div>
      <div>
        <el-form :model="addFrom" :rules="rule" ref="addFrom" label-width="120px">
          <el-form-item label="选择网点" prop="webPointId">
            <el-select v-model="addFrom.webPointId" placeholder="请选择" size="mini" @change="getTemplate">
              <el-option
                  v-for="item in webPoints"
                  :key="item.id"
                  :label="item.companyName+'('+item.webPointName+')'"
                  :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否打印" prop="webPointName">
            <el-select v-model="addFrom.hasPrint" placeholder="请选择" size="mini" @change="changePrint">
              <el-option
                  v-for="item in hasPrint"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <div style="display: flex" v-if="addFrom.hasPrint===1">
            <div>
              <el-form-item label="选择面单模板" prop="templateSize">
                <el-select v-model="addFrom.templateSize" placeholder="请选择" size="mini">
                  <el-option
                      v-for="item in templates"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <div
                style="margin: 10px 0px 0px 10px"><a href="https://www.yuque.com/kdnjishuzhichi/dfcrg1/vpptucr1q5ahcxa7"
                                                     target="_blank">模板规格样式参考
            </a></div>
          </div>
          <el-form-item label="快递业务类型" prop="expType">
            <el-select v-model="addFrom.expType" placeholder="请选择" size="mini" @change="changeExpTypes">
              <el-option
                  v-for="item in expTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运费支付方式" prop="payType">
            <el-select v-model="addFrom.payType" placeholder="请选择" size="mini">
              <el-option
                  v-for="item in payTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="省/市/区" prop="select" size="mini">
            <el-cascader
                v-model="addFrom.select"
                :options="options"
                @change="changeAddress"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input placeholder="详细地址（只填省市区后面的详细地址即可）" v-model="addFrom.address" size="mini"></el-input>
          </el-form-item>
          <el-form-item label="发货人名称" prop="name" size="mini">
            <el-input placeholder="请输入发货人信息" v-model="addFrom.name"></el-input>
          </el-form-item>
          <el-form-item label="发货人联系方式" prop="phone" label-width="130px" size="mini">
            <el-input placeholder="请输入发货人联系方式" v-model="addFrom.phone"></el-input>
          </el-form-item>
          <el-form-item label="是否需要快递公司上门取件" label-width="200px" size="mini">
            <el-switch
                v-model="addFrom.isNotice"
                active-color="#13ce66"
                inactive-color="#8c8c8c"
                active-value="0"
                inactive-value="1"
            >
            </el-switch>
          </el-form-item>
          <el-form-item label="预约上门取件时间" label-width="130px" size="mini" v-if="addFrom.isNotice==='0'">
            <el-date-picker
                v-model="addFrom.noticeTime"
                type="datetimerange"
                range-separator="至"
                start-placeholder="最早上门日期"
                end-placeholder="最晚上门日期">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>订单列表</span>
        <div style="color: #8c8c8c">下方带<span style="color: red">*</span>号的为必填内容，可将滚动条拖到底部横向滚动查看或编辑</div>
      </div>
      <div style="overflow: auto;display: flex;justify-content: center">
        <el-table :data="orderList" v-loading="loading" stripe style="max-width: 1700px; overflow-x: auto;" :row-height="10"
                  max-height="700px">
          <el-table-column label="产品信息" prop="webPointName" align="center" width="200px" fixed="left">
            <template slot-scope="scope">
              <div style="display: flex;align-items: center">
                <div>
                  <img class="avatar" :src="scope.row.proInfo.avatar | fullPath" alt=""/>
                </div>
                <div>
                  <p>{{ scope.row.proInfo.title }}</p>
                  <p v-if="scope.row.proInfo.specName">{{ scope.row.proInfo.specName }}</p>
                  <p>单价：{{ scope.row.proInfo.unitPrice }}</p>
                  <p>数量：{{ scope.row.count }}</p>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="平台订单号" prop="id" align="center" min-width="180px">
          </el-table-column>
          <el-table-column label="订单总额" prop="totalAmount" align="center">

          </el-table-column>
          <el-table-column label="收件人" prop="monthCode" align="center" width="125px">
            <template slot="header" slot-scope="scope">
              收件人<span style="color: red">*</span>
            </template>
            <template slot-scope="scope">
              <el-input
                  placeholder="姓名"
                  v-model="scope.row.consignee"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="收件人联系电话" prop="customerName" align="center" width="160px">
            <template slot="header" slot-scope="scope">
              收件人联系电话<span style="color: red">*</span>
            </template>
            <template slot-scope="scope">
              <el-input
                  placeholder="联系方式"
                  v-model="scope.row.phone"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="收件人省市区" align="center" width="250px">
            <template slot="header" slot-scope="scope">
              收件人省市区<span style="color: red">*</span>
            </template>
            <template slot-scope="scope">
              <el-cascader
                  v-model="scope.row.select"
                  :options="options"
              ></el-cascader>
            </template>
          </el-table-column>
          <el-table-column label="收件人详细地址" align="center" width="200px">
            <template slot="header" slot-scope="scope">
              收件人详细地址<span style="color: red">*</span>
            </template>
            <template slot-scope="scope">
              <el-input
                  placeholder="详细地址"
                  v-model="scope.row.addressDetail"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="商品品类" prop="sendSite" align="center" width="200px">
            <template slot="header" slot-scope="scope">
              商品品类<span style="color: red">*</span>
            </template>
            <template slot-scope="scope">
              <el-input
                  placeholder="例:衣服/酒水/零食等"
                  v-model="scope.row.goodsName"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="第三方平台订单号(菜鸟)" prop="sendSite" align="center" width="200px">
            <template slot-scope="scope">
              <el-input
                  placeholder="菜鸟订单号（非必填）"
                  v-model="scope.row.cnOrder"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="货物币种（顺丰港澳台）" align="center" width="150px">
            <template slot-scope="scope">
              <el-cascader
                  v-model="scope.row.currencyCode"
                  :options="currency"
              ></el-cascader>
            </template>
          </el-table-column>
          <el-table-column label="申报价值（顺丰港澳台）" align="center" width="150px">
            <template slot-scope="scope">
              <el-input
                  placeholder="单位/元"
                  v-model="scope.row.declaredValue"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" width="200px" fixed="right">
            <template slot-scope="scope">
              <el-input
                  placeholder="请输入内容"
                  v-model="scope.row.orderRemark"
                  clearable>
              </el-input>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <div style="height: 40px"></div>
    <!-- 弹框 -->
    <el-dialog title="发货结果通知" :visible.sync="addDialog" center @close="closeDialog" :close-on-click-modal="false">
      <el-table :data="resultList" v-loading="loading" stripe style="max-width: 1700px; overflow-x: auto;" :row-height="10"
                max-height="700px" @selection-change="handleSelectionChange">
        <el-table-column label="勾选" prop="id" align="center" type="selection">
        </el-table-column>
        <el-table-column label="产品信息" align="center" width="200px" fixed="left">
          <template slot-scope="scope">
            <div style="display: flex;align-items: center">
              <div>
                <img class="avatar" :src="scope.row.proInfo.avatar | fullPath" alt=""/>
              </div>
              <div>
                <p>{{ scope.row.proInfo.title }}</p>
                <p v-if="scope.row.proInfo.specName">{{ scope.row.proInfo.specName }}</p>
                <p>单价：{{ scope.row.proInfo.unitPrice }}</p>
                <p>数量：{{ scope.row.count }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="平台订单号" prop="orderNum" align="center" min-width="180px">
        </el-table-column>
        <el-table-column label="状态" prop="status" align="center" min-width="180px">
          <template slot-scope="scope">
            <span v-if="scope.row.status==='成功'" style="color: green;">{{ scope.row.status }}</span>
            <span v-if="scope.row.status==='失败'" style="color: red;">{{ scope.row.status }}</span>
          </template>
        </el-table-column>

        <el-table-column label="原因" prop="reason" align="center" min-width="180px">
          <template slot-scope="scope">
            <span v-if="scope.row.status==='成功'" style="color: green;">{{ scope.row.reason }}</span>
            <span v-if="scope.row.status==='失败'" style="color: red;">{{ scope.row.reason }}</span>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog=false">关 闭</el-button>
        <el-button type="primary" @click="$router.back()">返回订单列表</el-button>
        <el-button type="primary" @click="print()">打印</el-button>
      </span>
    </el-dialog>
    <div
        style="position: fixed;bottom: 1px;z-index: 10;">
      <div style="background-color: #F1F1F1;width: 100vw;height: 80px;display: flex;align-items: center;">
        <div style="margin-left: 30px">
          <el-button @click="goBack">返 回</el-button>
        </div>
        <div style="margin-left: 30px">
          <el-button type="primary" :disabled="reqFlag" @click="batchPrintTicket()">{{ btnTitle }}</el-button>
        </div>
      </div>
    </div>

    <vue-easy-print ref="listPrint">
      <div v-html="item.printTemplate" v-for="(item,index) in printList" style="page-break-after:always">
      </div>
    </vue-easy-print>
  </div>
</template>
<script>
import vueEasyPrint from "vue-easy-print"
import printTemplate from "@/utils/printTemplate";
import expType from "@/utils/expType";
import area from "@/utils/area3.js"

export default {
  components: {
    vueEasyPrint
  },
  data() {
    return {
      printList: [],
      resultList: [],
      reqFlag: false,
      interFaceType: "",
      btnTitle: "",
      currency: [{"value": "CNY", "label": "人民币"}, {"value": "HKD", "label": "港币"}, {"value": "NTD", "label": "新台币"}, {
        "value": "MOP",
        "label": "澳门元"
      }],
      orderList: [],
      options: this.transformAreaToOptions(area),
      payTypes: [{"value": "1", "label": "现结"}, {"value": "2", "label": "到付"}, {"value": "3", "label": "月结"}, {
        "value": "4",
        "label": "第三方付"
      }],
      expTypes: [],
      templates: [],
      webPoints: [],
      companyNameValid: true,
      addDialog: false,
      params: {
        pageNo: 1,
        pageSize: 10,
        isCount: true,
        type: 1,
        id: '',
      },
      hasPrint: [{"value": 1, "label": "需要"}, {"value": 0, "label": "不需要"}],
      list: [],
      total: 0,
      loading: false,
      addFrom: {
        hasPrint: 0,
        webPointId: "",
        expType: "",
        jdExpType: "",
        transType: "",
        address: "",
        phone: "",
        name: "",
        sendInfo: {},
        isNotice: "1",
        noticeTime: [],
        templateSize: "0"
      },

      rule: {
        address: {
          message: '请填写详细地址',
          required: true,
        },
        name: {
          message: '请填写发货人名称',
          required: true,
        },
        phone: {
          message: '请填写收货人联系方式',
          required: true,
        },
        select: {
          message: '请选择',
          required: true,
        },
        payType: {
          message: '请选择',
          required: true,
        },
        expType: {
          message: '请选择',
          required: true,
        },
        webPointId: {
          message: '请选择网点',
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
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);
    this.interFaceType = params.get('type')
    if (this.interFaceType === "1") {
      this.btnTitle = "提交打单（自动发货）"
    }
    if (this.interFaceType === "2") {
      this.btnTitle = "预约取件（自动发货）"
    }
    this.getList(1);
    this.getWebPoints();
    var orders = localStorage.getItem("orderList")
    if (orders) {
      this.orderList = JSON.parse(orders);
      console.log("list:", this.orderList)
      this.orderList.forEach(row => this.resolvedAddress(row))
    }
    // localStorage.removeItem("orderList")
  },

  methods: {
    print() {
      if (this.printList.length === 0) {
        this.$message.warning("请至少勾选一个订单进行打印")
        return;
      }
      this.$nextTick(() => {
        this.$refs.listPrint.print();
      })
    },

    handleSelectionChange(e) {
      //过滤下单失败的订单
      this.printList = e.filter(item => item.status === "成功")
      console.log("面单:",this.printList)
    },
    goBack() {
      this.$router.push('/order/bulkCenter')
    },
    batchPrintTicket() {
      if (this.interFaceType === "1") {
        console.log("公告参数:", this.addFrom)
        console.log("订单列表:", this.orderList)

        //校验公共参数
        if (!this.addFrom.webPointId) {
          this.notifySplicing(1, "", "网点未选择")
          return;
        }
        if (!this.addFrom.expType) {
          this.notifySplicing(1, "", "快递业务类型未选择")
          return;
        }
        if (!this.addFrom.payType) {
          this.notifySplicing(1, "", "运费支付类型未选择")
          return;
        }
        if (!this.addFrom.select || this.addFrom.select.length !== 3) {
          this.notifySplicing(1, "", "省市区未选择")
          return;
        }
        if (!this.addFrom.address) {
          this.notifySplicing(1, "", "详细地址未填写")
          return;
        }
        if (!this.addFrom.name) {
          this.notifySplicing(1, "", "发货人名称未填写")
          return;
        }
        if (!this.addFrom.phone) {
          this.notifySplicing(1, "", "发货人联系方式未填写")
          return;
        }
        if (this.addFrom.isNotice === "0") {
          if (!this.addFrom.noticeTime||this.addFrom.noticeTime.length < 2) {
            this.notifySplicing(1, "", "预约上门取件时间范围未填写")
            return;
          }
        }
        //校验订单参数
        console.log("开始校验订单参数")
        for (const order of this.orderList) {
          if (!order.consignee) {
            this.notifySplicing(2, order.id, "收件人姓名未填写")
            return;
          }
          if (!order.phone) {
            this.notifySplicing(2, order.id, "收件人联系电话未填写")
            return;
          }
          if (!order.select || order.select.length !== 3) {
            this.notifySplicing(2, order.id, "收件人省市区未选择")
            return;
          }
          if (!order.address) {
            this.notifySplicing(2, order.id, "收件人详细地址未填写")
            return;
          }
          if (!order.address) {
            this.notifySplicing(2, order.id, "收件人详细地址未填写")
            return;
          }
          if (!order.goodsName) {
            this.notifySplicing(2, order.id, "商品品类未填写")
            return;
          }
        }
        this.$confirm('确定开始打单发货吗？请仔细核对所有数据，否则可能会打单失败, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //校验通过，封装参数，请求打单
          this.addFrom.sendInfo.province = this.addFrom.select[0]
          this.addFrom.sendInfo.city = this.addFrom.select[1]
          this.addFrom.sendInfo.area = this.addFrom.select[2]
          this.addFrom.sendInfo.address = this.addFrom.address
          this.addFrom.sendInfo.phone = this.addFrom.phone
          this.addFrom.sendInfo.name = this.addFrom.name
          this.addFrom.orderList = this.orderList
          if (this.addFrom.isNotice === "0") {
            this.addFrom.startTime = this.$moment(this.addFrom.noticeTime[0]).format('Y-MM-DD HH:mm:ss');
            this.addFrom.endTime = this.$moment(this.addFrom.noticeTime[1]).format('Y-MM-DD HH:mm:ss');
          }
          console.log("提交参数:", this.addFrom)
          this.reqFlag = true
          this.$request.post({
            url: '/mt/order/batchPrintTicket',
            params: {params: JSON.stringify(this.addFrom)},
            success: (result) => {
              this.resultList = result
              this.filterSuccessOrder()
              this.addDialog = true
            },
            catch: (e) => {

            },
            finally: (e) => {
              this.reqFlag = false
            }
          });
        })

      }
    },
    //过滤成功的订单，从订单列表表格中剔除出去
    filterSuccessOrder() {
      var orderList = this.orderList.filter((item) => {
        return this.resultList.some(result => {
          return !(result.status === "成功" && item.id === result.orderNum);
        });
      });
      this.orderList = orderList
    },
    notifySplicing(type, order, reason) {
      var message;
      if (type === 1) {
        //公共参数出错
        message = "<span>公共参数错误，原因:</span><span style=\"color:red\">" + reason + "</span>"
      }
      if (type === 2) {
        //订单参数错误
        message = "<span>订单列表参数错误<br/>订单号:</span><span style=\"color:red\">" + order + "</span>原因:</span><span style=\"color:red\">" +
            reason +
            "</span>"
      }
      this.$notify({
        title: '提交参数错误',
        dangerouslyUseHTMLString: true,
        message: message,
        duration: 10000
      });
    },
    resolvedAddress(row) {
      var addressList = row.address.split("-")
      row.select = [];
      row.addressDetail = "";
      if (addressList.length === 3) {
        //封装省市区
        row.select[0] = this.cityCorrection(addressList[0])
        row.select[1] = addressList[1]
        var addressDetail = addressList[2].split(" ")
        row.select[2] = addressDetail[0]
        row.addressDetail = addressDetail[1]
        console.log("row:", row)
        return row;
      } else {
        this.$message.warning("订单号：" + row.id + "地址解析失败，请检查订单是否正确")
        return row;
      }
    },
    cityCorrection(city) {
      if (city === "北京市" || city === "重庆市" || city === "天津市" || city === "上海市") {
        city = city.replace("市", "");
      }
      return city;
    },
    changeAddress(e, value) {
      console.log("地址：", value)
    },
    transformAreaToOptions(area) {
      const options = [];

      // 遍历省份
      for (const provinceCode in area.province_list) {
        const province = {
          label: area.province_list[provinceCode],
          value: area.province_list[provinceCode],
          children: []
        };

        // 遍历城市
        for (const cityCode in area.city_list) {
          if (cityCode.startsWith(provinceCode.substring(0, 2))) {
            const city = {
              label: area.city_list[cityCode],
              value: area.city_list[cityCode],
              children: []
            };

            // 遍历区县
            for (const countyCode in area.county_list) {
              if (countyCode.startsWith(cityCode.substring(0, 4))) {
                const county = {
                  label: area.county_list[countyCode],
                  value: area.county_list[countyCode],
                };
                city.children.push(county);
              }
            }

            province.children.push(city);
          }
        }

        options.push(province);
      }
      this.getDefault()
      return options;
    },
    getDefault() {
      //获取默认地址
      this.$request.post({
        url: '/mt/defaultAddress/info',
        success: (result) => {
          if (result !== "操作成功") {
            this.addFrom.select = []
            this.addFrom.select[0] = result.province
            this.addFrom.select[1] = result.city
            this.addFrom.select[2] = result.area
            this.addFrom.address = result.address
            this.addFrom.phone = result.phone
            this.addFrom.name = result.name
          }
        },
        catch: (e) => {

        },
        finally: (e) => {

        }
      });
    },
    changeExpTypes(e) {
      //如果当前网点是京东快递，则将expType存到transType,然后expType定为6
      var obj = this.webPoints.find(item => item.id === this.addFrom.webPointId)
      if (obj.companyName === "京东快递") {
        this.addFrom.jdExpType = 6
        this.addFrom.transType = e
      }
      if (obj.companyName === "京东快运") {
        this.addFrom.jdExpType = 1
        this.addFrom.transType = e
      }
      console.log(this.addFrom)
    },
    changePrint(e) {
      console.log(e)
    },
    getWebPoints() {
      this.$request.post({
        url: '/mt/dotCode/listNoPage',
        success: (result) => {
          this.webPoints = result
          //回显默认网点
          if (this.webPoints.length === 0) {
            this.$message.error("电子面单打单需要绑定网点，请先移步至订单管理-网点管理中添加网点")
          } else {
            this.webPoints.forEach(item => {
              if (item.hasDefault === 1) {
                this.addFrom.webPointId = item.id
                this.getTemplate(item.id)
              }
            })
          }
        },
        catch: (e) => {

        },
        finally: (e) => {

        }
      });
    },
    getTemplate(id) {
      var obj = this.webPoints.find(item => item.id === id)
      console.log("obj:", obj)
      this.addFrom.courierCompany = obj.courierCompany
      //根据快递公司名字获取模板列表
      this.templates = []
      this.expTypes = []

      for (let printTemplateKey in printTemplate) {
        if (obj.companyName === printTemplateKey) {
          this.templates = printTemplate[printTemplateKey];
        }
      }
      if (this.templates.length === 0) {
        this.templates = [{"value": "0", "label": "默认模板"}]
        this.addFrom.templateSize = "默认模板"
      }

      for (let expTypeKey in expType) {
        if (obj.companyName === expTypeKey) {
          this.expTypes = expType[expTypeKey];
        }
      }

      if (this.expTypes.length === 0) {
        this.expTypes = [{"value": "1", "label": "默认"}]
        this.addFrom.expType = "1"
      }

      if (obj.companyName === "京东快递") {
        this.addFrom.transType = this.addFrom.expType
        this.addFrom.expType = "6"
      }

      if (obj.companyName === "京东快运") {
        this.addFrom.transType = this.addFrom.expType
        this.addFrom.expName = obj.expName
        this.addFrom.expType = "1"
      }
    },
    remove(id) {
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post({
          url: '/mt/dotCode/remove',
          params: {id: id},
          success: (result) => {
            this.$message.success(result)
            this.search()
          },
        });
      })
    },
    openUpdate(row) {
      this.addDialog = true
      this.addFrom = JSON.parse(JSON.stringify(row))
    },
    save() {
      this.$refs['addFrom'].validate((valid) => {
        if (!valid) {
          return;
        }
        if (!this.addFrom.monthCode && !this.addFrom.customerName && !this.addFrom.customerPwd) {
          this.$message.warning(" 月结号、客户编码、客户密码请根据实际网点给予的信息填写，至少填写一个")
          return;
        }
        if (this.companyNameValid) {
          this.$message.warning("快递公司名称错误，请检查后重新选择")
          return;
        }
        console.log("addFrom:", this.addFrom)
        this.$request.post({
          url: !this.addFrom.id ? '/mt/dotCode/add' : "/mt/dotCode/edit",
          params: this.addFrom,
          success: (result) => {
            this.$message.success(result)
            this.addDialog = false
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
          if (result.length === 0) {
            this.companyNameValid = true
          } else {
            this.companyNameValid = false
          }
          var newArray = result.map((item) => {
            return {"value": item.courierCompany, "courierCompany": item.companyNumber};
          });
          cb(newArray)
        },
      });
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
      this.resultList = []
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
@media print {
  /* 隐藏页眉 */
  @page {
    margin-top: 0;
  }

  /* 隐藏页脚 */
  @page {
    margin-bottom: 0;
  }

  /* 或者，完全禁用页眉和页脚 */
  @page {
    margin: 0;
  }
}
</style>