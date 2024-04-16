<template>
    <div id="order_detail">
        <el-button style="margin-bottom: 10px; width: 100px" type="primary" size="small" plain @click="$router.go(-1)">返回</el-button>

        <div class="card">
            <p>
                <b>商品信息</b>
                <span>
                    <!-- <span style="color: #E6A23C" v-if="shop.status">{{statusList.filter(i=> i.id==shop.status)[0].name}}</span> -->
                </span>
            </p>
            <!-- -----------------------------------列表------------------------------------ -->
            <el-table :data="goodsList" stripe v-loading="loading" style="width: 100%">
                <el-table-column align="center" label="商品封面">
                    <template slot-scope="scope">
                        <el-image style="width: 80px; height: 80px" fit="cover" :src="jsonParse(scope.row.proInfo, 'avatar')"> </el-image>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="标题">
                    <template slot-scope="scope">
                        {{ jsonParse(scope.row.proInfo, 'title') }}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="规格">
                    <template slot-scope="scope">
                        {{ jsonParse(scope.row.proInfo, 'specName')||'无' }}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="数量" prop="count"></el-table-column>
                <el-table-column align="center" label="单价">
                    <template slot-scope="scope">￥{{ scope.row.price.toFixed(2) }}</template>
                </el-table-column>
            </el-table>
        </div>

        <div class="card">
            <p>
                <b>订单信息</b>
            </p>
            <div>
                <div class="d_item">
                    <span>订单编号：</span>
                    <div>{{ order.id }}</div>
                </div>
                <div class="d_item">
                    <span>订单状态：</span>
                    <div v-if="order.type != 3">
                        <div v-for="item in statusList" :key="item.id">
                            <div :class="item.colors" v-if="item.id == order.status">{{ item.name }}</div>
                        </div>
                    </div>
                    <div v-else-if="order.type == 3">
                        <div v-for="item in groupStatusList"  :key="item.id">
                        <div :class="item.colors" v-if="item.id == order.status">{{ item.name }}</div>
                    </div>
                    </div>
                </div>
                <div class="d_item">
                    <span>商品总金额：</span>
                    <div>￥{{ order.totalAmount }}</div>
                </div>
                <div class="d_item">
                    <span>优惠券：</span>
                    <div>{{ order.discountPrice ? '￥' + order.discountPrice : '无折扣' }}</div>
                </div>
                <div class="d_item" v-if="order.carriage == 1">
                    <span>支付运费：</span>
                    <div class="warning">自提</div>
                </div>
                <div class="d_item" v-if="order.carriage == 2">
                    <span>支付运费：</span>
                    <div>{{ order.freight?"￥"+order.freight:'无' }}</div>
                </div>
                <div class="d_item" v-if="order.status == -1 || order.status == -2">
                    <span>实际支付总价：</span>
                    <div class="error">订单取消</div>
                </div>
                <div class="d_item" v-else>
                    <span>实际支付总价：</span>
                    <div class="error">￥{{ order.payAmount }}</div>
                </div>
                <div class="d_item">
                    <span>下单时间：</span>
                    <div> {{$moment(order.payTime).format('Y-MM-DD HH:mm')}}</div>
                </div>
                <div class="d_item">
                    <span>用户备注：</span>
                    <div> {{order.userRemark}}</div>
                </div>
            </div>
        </div>

        <div class="card">
            <p>
                <b>买家信息</b>
            </p>
            <div>
                <div class="d_item">
                    <span>收货人：</span>
                                       <div>{{order.consignee||user.name}}</div>

                </div>
                <div class="d_item" v-if="order.carriage == 1">
                    <span>配送方式：</span>
                    <div class="warning">到店自提</div>
                </div>
                <div class="d_item">
                    <span>收货人电话：</span>
                     <div>{{order.phone||user.mobile}}</div>
                </div>
                <div class="d_item" v-if="order.carriage == 2">
                    <span>收货地址：</span>
                    <div>送货上门</div>
                </div>
                <div class="d_item" v-if="order.carriage == 1">
                    <span>收货地址：</span>
                    <div class="warning">到店自提</div>
                </div>
                <div class="d_item" v-if="order.carriage == 2">
                    <span>收货地址：</span>
                    <div>{{ order.address }}</div>
                </div>
                <div class="d_item" v-if="order.carriage == 2">
                    <span>快递物流：</span>
                    <div>{{ order.express }}</div>
                </div>
                <div class="d_item" v-if="order.carriage == 2">
                    <span>快递单号：</span>
                    <div>{{ order.expressNum }}</div>
                </div>
               
                <!-- <div class="d_item">
                    <span>所在地址：</span>
                    <div>{{ user.address||'- -' }}</div>
                </div> -->
            </div>
        </div>

        <div class="card">
            <p>
                <b>卖家 /店铺信息</b>
            </p>
            <div>
                <!-- <div class="d_item">
                    <span>卖家账号：</span>
                    <div>{{ merchant.account }}</div>
                </div> -->
                <div class="d_item">
                    <span>店铺名称：</span>
                    <div>{{ shop.name }}</div>
                </div>
                <div class="d_item"></div>

                <!-- <div class="d_item">
                    <span>卖家行业：</span>
                    <div>{{ merchant.industryName }}</div>
                </div> -->
                <div class="d_item">
                    <span>店铺地址：</span>
                    <div>{{ shop.address }}</div>
                </div>
                <div class="d_item"></div>

                <!-- <div class="d_item">
                    <span>卖家所在城市：</span>
                    <div>{{ merchant.city }}</div>
                </div> -->
                <div class="d_item">
                    <span>店铺描述：</span>
                    <div>{{ shop.overview }}</div>
                </div>
                <div class="d_item"></div>
                <div class="d_item">
                    <span>店铺固定电话：</span>
                    <div>{{ shop.phone }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            id: '',
            goodsList: [],
            shop: {
                name: '',
                addr: '',
                overview: '',
                phone: ''
            }, //商家店铺信息
            merchant: {
                account: '', //账号
                city: '', //所在城市
                industryName: '' //行业
            }, //商家信息
            user: {
                name: '', //名称
                addr: '', //地址
                mobile: '' //手机账号
            }, //买家信息
            order: {},
            //秒杀 普通订单通用
            statusList: [
                { id: -1, name: '已退款', colors: 'error' },
                { id: -2, name: '订单超时未支付，或取消。', colors: 'error' },
                { id: 0, name: '待付款', colors: 'warning' },
                { id: 1, name: '已支付', colors: 'success' },
                { id: 2, name: '待评价', colors: 'info' },
                { id: 3, name: '已收货', colors: 'success' },
                { id: 4, name: '订单已完成', colors: 'success' },
                { id: 10, name: '待发货', colors: 'warning' },
                { id: 11, name: '待收货', colors: 'warning' },

            ],
            //团购
            groupStatusList: [
                { id: -2, name: '订单超时未支付，或取消。', colors: 'error' },
                { id: -1, name: '未成团', colors: 'info' },
                { id: 0, name: '待付款', colors: 'warning' },
                { id: 1, name: '待成团', colors: 'warning' },
                { id: 2, name: '已成团', colors: 'success' },
                { id: 3, name: '待评价', colors: 'info' },
                { id: 4, name: '订单已完成', colors: 'success' },
                { id: 5, name: '待成团', colors: 'warning' },
                { id: 10, name: '待发货', colors: 'warning' },
                { id: 11, name: '待收货', colors: 'warning' },
            ]
        };
    },

    methods: {
        getDetail() {
            this.$request.post({
                url: 'mt/order/detail',
                params: {
                    id: this.id
                },
                success: (res) => {
                    console.log(res);
                    let list = [];
                    list.push(res.order);
                    this.goodsList = list;
                    console.log(this.goodsList);
                    this.user = res.userInfo || {};
                    this.merchant = res.merchant||{};
                    this.shop = res.shop||{};
                    this.order = res.order;
                }
            });
        },

        //大图播放
        formatPath(imgs) {
            var paths = [];
            if (imgs) {
                imgs.split(',').forEach((item) => {
                    paths.push(this.$envConfig.serviceUrl + '/' + item);
                });
            }
            return paths;
        },
        //josn 转换
        jsonParse(json, name) {
            if (json != null && json != '') {
                let jsonPro = JSON.parse(json);
                if (jsonPro != null) {
                    //进行name 判断解析参数
                    if (name == 'avatar') {
                        if (jsonPro.avatar != '' && jsonPro.avatar != null) {
                            return jsonPro.avatar;
                        }
                    } else if (name == 'title') {
                        if (jsonPro.title != '' && jsonPro.title != null) {
                            return jsonPro.title;
                        }
                    } else if (name == 'specName') {
                        if (jsonPro.specName != '' && jsonPro.specName != null) {
                            return jsonPro.specName;
                        }
                    }
                }
                return '';
            }
            return '';
        }
    },

    mounted() {
        this.id = this.$route.query.id;
        this.getDetail();
    }
};
</script>

<style>
#order_detail .el-alert__title {
    font-size: 16px;
    line-height: 27px;
}
</style>
<style scoped>
.card {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    color: #606266;
    margin-bottom: 30px;
    margin-top: 10px;
}
.card > p {
    background: #f8f8f8;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card > p b {
    padding-left: 10px;
    display: inline-block;
    border-left: 5px solid #409eff;
}
.card > div {
    padding: 40px;
    display: flex;
    flex-wrap: wrap;
}
.card .d_img {
    width: 80px;
    height: 80px;
}
.card .d_item {
    font-size: 15px;
    padding: 10px 0;
    display: flex;
    width: 50%;
}
.card .d_item span {
    width: 150px;
}
.card .d_item a {
    color: #f56c6c;
}
</style>

