<template>
  <div id="">
    <div>
      <el-form :model="addFrom" :rules="rule" ref="addFrom" label-width="120px">
        <el-form-item label="选择网点" prop="webPointId">
          <el-select v-model="addFrom.webPointId" placeholder="请选择" size="small" @change="getTemplate">
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
          <el-select v-model="addFrom.hasPrint" placeholder="请选择" size="small" @change="changePrint">
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
              <el-select v-model="addFrom.templateSize" placeholder="请选择" size="small">
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
          <el-select v-model="addFrom.expType" placeholder="请选择" size="small" @change="changeExpTypes">
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
          <el-select v-model="addFrom.payType" placeholder="请选择" size="small">
            <el-option
                v-for="item in payTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="省/市/区" prop="select">
          <el-cascader
              v-model="addFrom.select"
              :options="options"
              @change="changeAddress"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input placeholder="详细地址（只填省市区后面的详细地址即可）" v-model="addFrom.address"></el-input>
        </el-form-item>
        <el-form-item label="发货人名称" prop="name">
          <el-input placeholder="请输入发货人信息" v-model="addFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="发货人联系方式" prop="phone" label-width="130px">
          <el-input placeholder="请输入发货人联系方式" v-model="addFrom.phone"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div style="height: 300px;overflow: auto;display: flex;justify-content: center">
      <el-table :data="list" v-loading="loading" stripe  height="300px" style="max-width: 1700px; overflow-x: auto;" :row-height="10">
        <el-table-column label="产品信息" prop="webPointName" align="center" width="200px" fixed="left">

        </el-table-column>
        <el-table-column label="平台订单号" prop="courierCompany" align="center" min-width="180px">
        </el-table-column>
        <el-table-column label="订单总额" prop="companyName" align="center"></el-table-column>
        <el-table-column label="收件人" prop="monthCode" align="center">
          <template slot="header" slot-scope="scope">
            收件人<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            {{ scope.row.monthCode ? scope.row.monthCode : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="收件人联系电话" prop="customerName" align="center" width="200px">
          <template slot="header" slot-scope="scope">
            收件人联系电话<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            {{ scope.row.customerName ? scope.row.customerName : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="收件人省市区" prop="customerPwd" align="center" width="200px">
          <template slot="header" slot-scope="scope">
            收件人省市区<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            {{ scope.row.customerPwd ? scope.row.customerPwd : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="收件人详细地址" prop="sendSite" align="center" width="200px">
          <template slot="header" slot-scope="scope">
            收件人详细地址<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            {{ scope.row.sendSite ? scope.row.sendSite : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="商品品类" prop="sendSite" align="center" width="150px">
          <template slot="header" slot-scope="scope">
            商品品类<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            {{ scope.row.sendSite ? scope.row.sendSite : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="第三方平台订单号(菜鸟)" prop="sendSite" align="center" width="200px">
          <template slot-scope="scope">
            {{ scope.row.sendSite ? scope.row.sendSite : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="货物币种（顺丰港澳台）" align="center">
          <template slot-scope="scope">
            {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="申报价值（顺丰港澳台）" align="center">
          <template slot-scope="scope">
            {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center"  width="200px" fixed="right">
          <template slot-scope="scope">
            <el-input
                placeholder="请输入内容"
                v-model="input"
                clearable>
            </el-input>
          </template>
        </el-table-column>
      </el-table>
    </div>


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
          <el-input placeholder="请根据实际网点提供的月结号填写(没有可不填)" v-model="addFrom.monthCode"></el-input>
        </el-form-item>
        <el-form-item label="客户编码">
          <el-input placeholder="请根据实际网点提供的客户编码填写(没有可不填)" v-model="addFrom.customerName"></el-input>
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
import printTemplate from "@/utils/printTemplate";
import expType from "@/utils/expType";
import area from "@/utils/area3.js"

export default {
  data() {
    return {
      options: this.transformAreaToOptions(area),
      payTypes:[{"value":"1","label":"现结"},{"value":"2","label":"到付"},{"value":"3","label":"月结"},{"value":"4","label":"第三方付"}],
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
        jdExpType:"",
        transType:"",
        address:"",
        phone:"",
        name:""
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
    this.getList(1);
    this.getWebPoints();

  },

  methods: {
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
    getDefault(){
      //获取默认地址
      this.$request.post({
        url: '/mt/defaultAddress/info',
        success: (result) => {
          if(result!=="操作成功"){
            this.addFrom.select=[]
            this.addFrom.select[0]=result.province
            this.addFrom.select[1]=result.city
            this.addFrom.select[2]=result.area
            this.addFrom.address=result.address
            this.addFrom.phone=result.phone
            this.addFrom.name=result.name

          }

          console.log("add:",this.addFrom)
        },
        catch: (e) => {

        },
        finally: (e) => {

        }
      });
    },
    changeExpTypes(e){
     //如果当前网点是京东快递，则将expType存到transType,然后expType定为6
      var obj = this.webPoints.find(item => item.id === this.addFrom.webPointId)
      if (obj.companyName === "京东快递") {
        this.addFrom.jdExpType=6
        this.addFrom.transType=e
      }

      if (obj.companyName === "京东快运") {
        this.addFrom.jdExpType=1
        this.addFrom.transType=e
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
      //根据快递公司名字获取模板列表
      this.templates = []
      this.expTypes = []
      this.addFrom.templateSize = "0"
      this.addFrom.expType=""
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
        this.addFrom.expName=obj.expName
        this.addFrom.expType = "1"
      }
      console.log("this.addFrom:",this.addFrom)
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
      this.addFrom = {
        webPointName: "",
        companyName: "",
        courierCompany: "",
        monthCode: "",
        customerName: "",
        customerPwd: "",
        sendSite: ""
      }
      this.companyNameValid = false
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
</style>