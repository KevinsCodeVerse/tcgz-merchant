<template>
  <div id="">
    <el-tabs v-model="tabStatus" @tab-click="clicktapItem">
      <el-tab-pane label="全部" name="-10"></el-tab-pane>
      <el-tab-pane v-for="item in statusList" :label="item.name" :name="item.id.toString()" :key="item.id"
                   v-if="params.type!=='3'"></el-tab-pane>
      <el-tab-pane v-for="item in ptStatusList" :label="item.name" :name="item.id.toString()" :key="item.id"
                   v-if="params.type==='3'"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true" size="medium">
      <el-form-item>
        <el-select v-model="params.type" placeholder="订单类型" size="small">
          <el-option
              v-for="item in orderType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="params.shippingState" placeholder="物流状态" size="small">
          <el-option
              v-for="item in shippingStateS"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
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

      <div>
        <el-form-item v-if="showYYQJ">
          <el-tooltip class="item" effect="dark" content="一次性预约多个包裹，快递将准时取件" placement="top-start">
            <el-button type="success" @click="goPage(3)">预约取件</el-button>
          </el-tooltip>

        </el-form-item>
        <el-form-item v-if="showPLFH">
          <el-tooltip class="item" effect="dark" content="自行投递多件包裹，适合零散订单" placement="top-start">
            <el-button type="primary" @click="goPage(2)">商家自寄</el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="showPLDD">
          <el-tooltip class="item" effect="dark" content="一键生成多张电子面单，提高发货效率" placement="top-start">
            <el-button type="warning" @click="goPage(1)">打单发货</el-button>
          </el-tooltip>
        </el-form-item>
      </div>
    </el-form>

    <el-table :data="list" v-loading="loading" stripe fixed="right" @selection-change="handleSelectionChange">
      <el-table-column label="勾选" prop="id" align="center" type="selection">
      </el-table-column>
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
      <el-table-column label="物流状态" prop="shippingState" align="center">
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
      <el-table-column label="物流下单模式" align="center" width="150px">
        <template slot-scope="scope">
          {{ getKdnType(scope.row.kdnType) }}
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
      <el-table-column label="操作" align="center" width="150px">
        <template slot-scope="scope">
          <div style="display: flex;flex-direction: column;justify-content: space-around;align-items: center;height: 180px">
            <el-button type="primary" size="mini" @click="goDetail(scope.row.id)">详情</el-button>
            <el-button type="danger" size="mini" @click="manuallyCancelOrder(scope.row.id)" v-if="scope.row.billingStatus===1">
              取消电子面单
            </el-button>
            <el-button type="danger" size="mini" @click="cancel(1,scope.row.id)" v-if="scope.row.status===11&&scope.row.billingStatus===1">
              取消发货
            </el-button>
            <el-button type="danger" size="mini" @click="cancel(2,scope.row.id)" v-if="scope.row.status===11&&scope.row.prePickUp===1">
              取消发货
            </el-button>
            <el-button type="danger" size="mini" @click="cancel(3,scope.row.id)"
                       v-if="scope.row.status===11&&scope.row.prePickUp===0&&scope.row.billingStatus===0">
              取消发货
            </el-button>

          </div>
          <!--          <el-button size="small" type="success" v-if="scope.row.status == 10"-->
          <!--                     @click="(deliveryData.id = scope.row.id), (deliveryShow = true)">发货-->
          <!--          </el-button>-->
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


    <!-- 批量发货弹框 -->
    <el-dialog title="批量发货" :visible.sync="deliveryShow" center @close="closeDialog" :close-on-click-modal="false"
               v-loading="batchDevFlag" width="1800px">
      <el-table :data="orderList" v-loading="loading" stripe style="max-width: 1700px; overflow-x: auto;" :row-height="10"
                max-height="700px">
        <el-table-column label="产品信息" align="center" width="200px">
          <template slot-scope="scope">
            <div style="display: flex;align-items: center;justify-content: center">
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
        <el-table-column label="订单号" prop="id" align="center" min-width="180px">
        </el-table-column>
        <el-table-column label="快递公司" align="center" min-width="180px">
          <template slot="header" slot-scope="scope">
            快递公司<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            <el-autocomplete
                v-model="scope.row.companyName"
                :fetch-suggestions="querySearchAsync"
                placeholder="输入快递公司名称搜索"
                @select="(value) => handleSelect(scope.row, value)"
                size="mini"
            ></el-autocomplete>
          </template>
        </el-table-column>
        <el-table-column label="快递单号" align="center" min-width="180px">
          <template slot="header" slot-scope="scope">
            快递单号<span style="color: red">*</span>
          </template>
          <template slot-scope="scope">
            <el-input
                placeholder="请输入快递单号"
                v-model="scope.row.companyNum" size="mini"
                clearable>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="发货结果" prop="reason" align="center" width="300px">
          <template slot-scope="scope">
            <span v-if="scope.row.status==='成功'" style="color: green;">{{ scope.row.reason }}</span>
            <span v-if="scope.row.status==='失败'" style="color: red;">{{ scope.row.reason }}</span>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关 闭</el-button>
        <el-button @click="batchDev" type="primary">提 交</el-button>
      </span>
    </el-dialog>
    <vue-easy-print ref="listPrint">
      <div v-html="returnedHtml" v-for="(item_cm,index_cm) in 2" style="page-break-after:always">
      </div>
    </vue-easy-print>
  </div>
</template>
<script>
import vueEasyPrint from "vue-easy-print"

export default {
  components: {
    vueEasyPrint
  },
  data() {
    return {
      returnedHtml: "<!DOCTYPE html>\n" +
          "<html lang=\"zh-CN\">\n" +
          "\n" +
          "  <head>\n" +
          "    <meta charset=\"utf-8\" />\n" +
          "    <title>邮政 100*180,110</title>\n" +
          "    <style>* { margin: 0; padding: 0; } .print_paper { font-size: 14px; border: none; border-collapse: collapse; width: 375px; margin-top: -1px; table-layout: fixed; } .print_paper td { border: solid #000 1px; } .no_border td { border: none; vertical-align: top; } .fhei { font-family: 'SimHei'; } .fam { font-family: '微软雅黑'; } .f30 { font-size: 30pt; } .f24 { font-size: 24pt; } .f20 { font-size: 20pt; } .f16 { font-size: 16pt; } .f15 { font-size: 15pt; } .f13 { font-size: 13pt; } .f12 { font-size: 12pt; } .f9 { font-size: 9pt; } .f8 { font-size: 8pt; } .f7 { font-size: 7pt; } .b { font-weight: bold; } .tc { text-align: center; } .vt { vertical-align: top; } .print_paper .bln { border-left: none; } .print_paper .brn { border-right: none; } .lh14 { line-height: 14px; } .lh14 { line-height: 16px; } .pp-bn td { border: none; } .t-bn td { border: none; } .pl5 { padding-left: 5px; } .rel { position: relative; } .abs { position: absolute; }</style>\n" +
          "  </head>\n" +
          "\n" +
          "  <body class=\"fhei f12\">\n" +
          "    <table class=\"print_paper \">\n" +
          "      <tr height=\"39\">\n" +
          "        <td class=\"b brn f13 pl5\" width=\"275\">\n" +
          "          <img height=\"32\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAAiCAMAAABMbYZPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRFFhYWWFhY1tbWf39/v7+/Pz8/AAAA////uiq4sAAAAoVJREFUeNrsl9tu7CAMRX0B5///uLYBOyEwk1bnaFSpPEwTAizYvlE4PtXgt5ALfYhchC+vlxbdUjfTWco7smR7QS5yaVcyeZ8Pp9oaw1uyPCUDRxsj9fBSSyH9WKENzx3CSZwN+dbV963L+e47uUYLcmdU22TNM9oj9G/lBXll4XMLcvTUJLNK4WSSXF3JujnTBpgW5JR4Fru48ZraJcnpUEm2DifzsI0+VN2QnZbC/TZkeUjmYYGyIIPQiaxW13lFcEPeWXpDDrlPdratOLkOipPtQz0wTL8m312sNN/qv5PaAOep6WEjipysjypC6LBRe0Veelgjo+l7V/sYhh5kFMgsA08SiEdV6kwRVR7P7sq8IvetBZkipO7kb2XPZQ5Lcg1Ds6B5WLWInsnzEpujz+SaWftu50ga3P0QQEBihTVZHpIhk9jJt+3Nz8zDwfxZowzU1FLpAfkHalc3rYJOQ0vnY/tzzp5tWv7u7D18a/GG+Gqo76kR6VIxps3Hsf//neROlk+QXew7WQMD2RyV3F1dTnYFGV1dvBRUq0gFAVx0sqjiuCLQFM8JWli6GNfis91oqhytAFsydKfCiBf36jZ0xDT4ZCbvZ76Tr5aerlDsjkszWQ9gZPJ6cAoAjSDwxa1GeCT56XlVMV6Sq8QWTC8YZE1PTtb1RxnSQlgYhXtBtHEqCGA53pMXYQVJVrk4yLooGxmAsR+6hTmOS4BvgCyP4Zb86j7UDoQyq22PmpBdiV4UI4e0ioh2D+Ih24q8ucIOh9VDqZ43D7MvViEgq2ZJVwNzqUp6IWPz8x+RNSI07eKRZHL79cLRYNUPmXmz9DkaVaY/PSH//Uf3R/5H7UuAAQBJVmQXqLW9eQAAAABJRU5ErkJggg==\" alt=\"\" />\n" +
          "        </td>\n" +
          "        <td class=\"bln f13\">\n" +
          "          <div style=\"display: none\">代收货款</div>\n" +
          "        </td>\n" +
          "      </tr>\n" +
          "    </table>\n" +
          "    <table class=\"print_paper \">\n" +
          "      <tr height=\"56\">\n" +
          "        <td class=\"tc f20 b fam\">010-010-A62-203</td>\n" +
          "      </tr>\n" +
          "    </table>\n" +
          "    <table class=\"print_paper \">\n" +
          "      <tr height=\"34\">\n" +
          "        <td width=\"275\" class=\"pl5 f16\">北京市北京市</td>\n" +
          "        <td class=\"tc\">\n" +
          "        </td>\n" +
          "      </tr>\n" +
          "    </table>\n" +
          "    <table class=\"print_paper \">\n" +
          "      <tr height=\"71\">\n" +
          "        <td width=\"20\">收件</td>\n" +
          "        <td class=\"f11 vt\">\n" +
          "          <div style=\"height: 70px;overflow:hidden;\">刘 158****7517\n" +
          "            <br />北京市北京市东城区崇文门外街道五老胡同兴隆都市馨园8号楼</div>\n" +
          "        </td>\n" +
          "  <td class=\"f9 lh14 vt\" rowspan=\"2\" width=\"92\">\n" +
          "  <div style=\"height: 70px;\">\n" +
          "  <div class=\"f10 tc\" style=\"border-bottom:1px solid #000;line-height: 20px;\">服务</div>\n" +
          "  <div class=\"f6 pl5 pt5\" style=\"line-height: 14px;\">付款方式：寄付月结\n" +
          "  <div style=\"display: none\">保价金额：￥元</div>\n" +
          "  <div style=\"display: none\">代收金额：￥${Amount}元</div>\n" +
          "  </div>\n" +
          "  </div>\n" +
          "  </td>\n" +
          "  </tr>\n" +
          "  <tr height=\"48\">\n" +
          "  <td width=\"20\">寄件</td>\n" +
          "  <td class=\"f8 vt\">\n" +
          "  <div style=\"height: 47px;overflow:hidden;\">品牌服装店 177****2358\n" +
          "  <br />吉林省吉林市丰满区中环都市花园</div>\n" +
          "  </td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  <table class=\"print_paper \">\n" +
          "  <tr height=\"80\">\n" +
          "  <td class=\"tc f15 lh14 b fam\">\n" +
          "  <img width=\"270\" height=\"56\" src=\"data:image/gif;base64,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\" alt=\"\" />\n" +
          "  <br />9738328944038</td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  <table class=\"print_paper \">\n" +
          "  <tr height=\"82\">\n" +
          "  <td class=\"f8\" width=\"166\">快件送达收件人地址，经收件人或收件人（寄件人）允许的代收人签字，视为送达，您的签字代表您已验收此包裹，并以确定商品信息无误，包装完好，没有划痕，破损等质量问题。</td>\n" +
          "  <td class=\"pl5\">签收人：\n" +
          "  <br />\n" +
          "  <br />时间：</td>\n" +
          "  <td class=\"tc\" width=\"74\">\n" +
          "  </td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  <table class=\"print_paper \">\n" +
          "  <tr height=\"60\">\n" +
          "  <td class=\"b brn f13\" width=\"150\">\n" +
          "  <img width=\"140\" style=\"margin-left:5px;\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAAiCAMAAABMbYZPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRFFhYWWFhY1tbWf39/v7+/Pz8/AAAA////uiq4sAAAAoVJREFUeNrsl9tu7CAMRX0B5///uLYBOyEwk1bnaFSpPEwTAizYvlE4PtXgt5ALfYhchC+vlxbdUjfTWco7smR7QS5yaVcyeZ8Pp9oaw1uyPCUDRxsj9fBSSyH9WKENzx3CSZwN+dbV963L+e47uUYLcmdU22TNM9oj9G/lBXll4XMLcvTUJLNK4WSSXF3JujnTBpgW5JR4Fru48ZraJcnpUEm2DifzsI0+VN2QnZbC/TZkeUjmYYGyIIPQiaxW13lFcEPeWXpDDrlPdratOLkOipPtQz0wTL8m312sNN/qv5PaAOep6WEjipysjypC6LBRe0Veelgjo+l7V/sYhh5kFMgsA08SiEdV6kwRVR7P7sq8IvetBZkipO7kb2XPZQ5Lcg1Ds6B5WLWInsnzEpujz+SaWftu50ga3P0QQEBihTVZHpIhk9jJt+3Nz8zDwfxZowzU1FLpAfkHalc3rYJOQ0vnY/tzzp5tWv7u7D18a/GG+Gqo76kR6VIxps3Hsf//neROlk+QXew7WQMD2RyV3F1dTnYFGV1dvBRUq0gFAVx0sqjiuCLQFM8JWli6GNfis91oqhytAFsydKfCiBf36jZ0xDT4ZCbvZ76Tr5aerlDsjkszWQ9gZPJ6cAoAjSDwxa1GeCT56XlVMV6Sq8QWTC8YZE1PTtb1RxnSQlgYhXtBtHEqCGA53pMXYQVJVrk4yLooGxmAsR+6hTmOS4BvgCyP4Zb86j7UDoQyq22PmpBdiV4UI4e0ioh2D+Ih24q8ucIOh9VDqZ43D7MvViEgq2ZJVwNzqUp6IWPz8x+RNSI07eKRZHL79cLRYNUPmXmz9DkaVaY/PSH//Uf3R/5H7UuAAQBJVmQXqLW9eQAAAABJRU5ErkJggg==\" alt=\"\" />\n" +
          "  </td>\n" +
          "  <td class=\"bln  tc lh14 fam\">\n" +
          "  <img width=\"176\" height=\"30\" src=\"data:image/gif;base64,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\" alt=\"\" />\n" +
          "  <br />9738328944038</td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  <table class=\"print_paper \">\n" +
          "  <tr height=\"48\">\n" +
          "  <td width=\"20\">收件</td>\n" +
          "  <td class=\"f8 vt\">\n" +
          "  <div style=\"height: 47px;overflow:hidden;\">刘 158****7517\n" +
          "  <br />北京市北京市东城区崇文门外街道五老胡同兴隆都市馨园</div>\n" +
          "  </td>\n" +
          "  <td class=\"f9 lh14  tc\" rowspan=\"2\" width=\"74\">自定义二维码</td>\n" +
          "  </tr>\n" +
          "  <tr height=\"37\">\n" +
          "  <td width=\"20\">寄件</td>\n" +
          "  <td class=\"f8 vt\">\n" +
          "  <div style=\"height: 36px;overflow:hidden;\">品牌服装店\n" +
          "  <br />吉林省吉林市丰满区中环都市花园</div>\n" +
          "  </td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  <table class=\"print_paper \">\n" +
          "  <tr height=\"106\">\n" +
          "  <td class=\"vt rel\" style=\"height: 106px;overflow:hidden;\">\n" +
          "  <div class=\"f8\" style=\"height: 100px;overflow:hidden;\">时尚羽绒服x1件\n" +
          "  <br></div>\n" +
          "  <div class=\"abs\" style=\"top: 85px;right: 5px;\">已检视</div>\n" +
          "  </td>\n" +
          "  </tr>\n" +
          "  </table>\n" +
          "  </body>\n" +
          "\n" +
          "  </html>",
      batchDevFlag: false,
      orderType: [{"value": "3", "label": "拼团订单"}, {"value": "1", "label": "普通订单"}, {"value": "2", "label": "秒杀订单"}],
      shippingStateS: [{"value": "0", "label": "待揽件"}, {"value": "1", "label": "已揽收"}, {"value": "2", "label": "在途中"}, {
        "value": "3",
        "label": "已签收"
      }, {"value": "4", "label": "问题件"}],
      showYYQJ: true,
      showPLFH: true,
      showPLDD: true,
      orderList: [],
      params: {
        pageNo: 1,
        pageSize: 10,
        isCount: true,
        type: "1",
        id: '',
        status: '',
        userName: '',
        shippingState: ''
      },
      tabStatus: '10',
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
        // {id: -3, name: '待揽件'},
        {id: 11, name: '待收货'},
        {id: 2, name: '待评价'},
        {id: 3, name: '已评价'},
        {id: -1, name: '已退款'},
        {id: -2, name: '已取消'}
      ],
      ptStatusList: [
        {id: 0, name: '待支付'},
        {id: 5, name: '待拼团'},
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
    printHtml() {
      // 创建一个新的窗口
      const printWindow = window.open('', '_blank');

      // 将HTML字符串写入新窗口
      printWindow.document.write(this.returnedHtml);

      // 等待HTML加载完成后再执行打印操作
      printWindow.document.addEventListener('DOMContentLoaded', () => {
        printWindow.print(); // 打印新窗口中的HTML内容
      });
    },
    manuallyCancelOrder(id) {
      this.$confirm('确定取消电子面单吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post({
          url: '/mt/order/cancelPrintTicket',
          params: {orderId: id},
          success: (result) => {
            if(result===1){
              this.$message.success("取消电子面单成功")
              this.search()
            }else {
              this.$confirm('线上取消电子面单失败，如需取消请先点击确定手动取消，然后联系线下网点工作人员取消面单?', '提示', {
                confirmButtonText: '确定',
                type: 'warning'
              }).then(() => {
                this.$request.post({
                  url: '/mt/order/manuallyCancelThree',
                  params: {orderId: result},
                  success: (result) => {
                    this.$message.success(result)
                    this.search()
                  },
                  catch: (e) => {

                  },
                  finally: (e) => {

                  }
                });
              })
            }

          },
          catch: (e) => {

          },
          finally: (e) => {
            console.log(e)
          }
        });
      })

    },
    getKdnType(type) {
      switch (type) {
        case 0:
          return "无"
        case 1:
          return "商家自寄"
        case 2:
          return "打单发货"
        case 3:
          return "预约取件"
        default:
          return "异常"
      }
    },
    batchDev() {
      for (let order of this.orderList) {
        if (!order.companyName) {
          this.$message.error("订单:" + order.id + "未选择快递公司")
          return;
        }
        if (!order.courierCompany) {
          this.$message.error("订单:" + order.id + "未选择快递公司")
          return;
        }
        if (!order.companyNum) {
          this.$message.error("订单:" + order.id + "未输入快递单号")
          return;
        }
      }
      this.$confirm('此操作将对选中订单进行发货并订阅物流轨迹操作,请仔细核对快递单号，否则可能导致订阅失败，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.batchDevFlag = true;
        this.$request.post({
          url: '/mt/order/batchDelivery',
          params: {infos: JSON.stringify(this.orderList)},
          success: (result) => {
            // this.$message.success(result)
            this.orderList = result
          },
          catch: (e) => {

          },
          finally: (e) => {
            this.batchDevFlag = false
          }
        });
      })
    },
    manuallyCancelThree(id) {
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
    handleSelect(row, e) {
      row.courierCompany = e.courierCompany
    },
    cancel(type, id) {
      var title = type === 1 ? "取消发货同时取消电子面单" : type === 2 ? "取消发货同时取消预约取件" : "取消发货"
      this.$confirm('此操作将' + title + "，是否继续操作？", '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post({
          url: '/mt/order/cancelDelivery',
          params: {
            orderId: id
          },
          success: (result) => {
            this.$message.success(result)
            this.search(1);
          },
          catch: (e) => {

          },
          finally: (e) => {

          }
        });
      })
    },
    handleSelectionChange(e) {
      e = e.filter(item => item.status === 10);
      this.orderList = e
    },
    getShippingState(state) {
      switch (state) {
        case 0:
          return "暂无轨迹信息（待揽件）";
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
          return "--"
      }
    },
    // 重置
    reset() {

      this.$nextTick(() => {
        this.$refs.listPrint.print();
      })
      (this.params = {
        pageNo: 1,
        pageSize: 10,
        isCount: true,
        type: "1",
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
    goPage(type) {
      if (this.orderList.length === 0) {
        this.$message.warning("请至少选择一个订单")
        return;
      }
      if (type === 1) {
        var flag = false;
        this.orderList.forEach(item => {
          if (item.carriage !== 2) {
            this.$message.warning("订单:" + item.id + "状态非快递物流单，无法操作，请取消勾选")
            flag = true
          }
          if (item.status !== 10) {
            this.$message.warning("订单:" + item.id + "状态错误，无法发货，请取消勾选")
            flag = true
          }
          if (item.billingStatus !== 0) {
            this.$message.warning("订单:" + item.id + "已打单，请取消勾选")
            flag = true
          }
        })
        if (!flag) {
          this.orderList.forEach(item => item.addressDetail = "")
          localStorage.setItem("orderList", JSON.stringify(this.orderList))
          this.$router.push({
            path: '/order/bulkShipment?type=' + type,
          });
        }
      }
      if (type === 2) {
        var flag = false;
        this.orderList.forEach(item => {
          if (item.carriage !== 2) {
            this.$message.warning("订单:" + item.id + "状态非快递物流单，无法操作，请取消勾选")
            flag = true
          }
          if (item.status !== 10) {
            this.$message.warning("订单:" + item.id + "状态错误，无法发货，请取消勾选")
            flag = true
          }
        })
        if (!flag) {
          this.orderList.forEach(item => {
            item.expressNum = ""
            item.express = ""
          })
          this.deliveryShow = true;
          console.log("订单列表:", this.orderList)
        }
      }
      if (type === 3) {
        var flag = false;
        this.orderList.forEach(item => {
          if (item.carriage !== 2) {
            this.$message.warning("订单:" + item.id + "状态非快递物流单，无法操作，请取消勾选")
            flag = true
          }
          if (item.prePickUp === 1) {
            this.$message.warning("订单:" + item.id + "已预约，请取消勾选")
            flag = true
          }
          if (item.status !== 10) {
            this.$message.warning("订单:" + item.id + "状态错误，无法预约取件，请取消勾选")
            flag = true
          }
        })
        if (!flag) {
          localStorage.setItem("orderList", JSON.stringify(this.orderList))
          this.$router.push({
            path: '/order/appointment?type=' + 1,
          });
        }
      }
    },
    // 点击tap
    clicktapItem(e) {
      this.showPLDD = false;
      this.showYYQJ = false;
      this.showPLFH = false;
      this.showDY = false;
      this.params.shippingState = '';
      if (e.index === "3") {
        this.showPLDD = true;
        this.showYYQJ = true;
        this.showPLFH = true;
      }
      this.search();
    },
    // 关闭 弹窗后
    closeDialog() {
      this.deliveryShow = false;
      this.search()
      // this.orderList=[]
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
      if (this.params.status === "-3") {
        this.params.status = "";
        this.params.shippingState = "0";
      }
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