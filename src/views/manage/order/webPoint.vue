<template>
    <div id="">
        <div style="margin-bottom: 10px">
            <el-button type="warning" @click="addDialog = true">新增网点</el-button>
            <el-button type="success" @click="openAddress">设置默认发货地址</el-button>
        </div>

        <el-table :data="list" v-loading="loading" stripe fixed="right">
            <el-table-column label="网点名称" prop="webPointName" align="center" width="200px"></el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                    {{ scope.row.status === 0 ? '审核中' : scope.row.status === 1 ? '正常' : '审核未通过' }}
                </template>
            </el-table-column>
            <el-table-column label="快递公司编码" prop="courierCompany" align="center" min-width="180px"> </el-table-column>
            <el-table-column label="快递公司名称" prop="companyName" align="center"></el-table-column>
            <el-table-column label="月结号" prop="monthCode" align="center">
                <template slot-scope="scope">
                    {{ scope.row.monthCode ? scope.row.monthCode : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="客户编码" prop="customerName" align="center">
                <template slot-scope="scope">
                    {{ scope.row.customerName ? scope.row.customerName : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="客户密码" prop="customerPwd" align="center">
                <template slot-scope="scope">
                    {{ scope.row.customerPwd ? scope.row.customerPwd : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="网点编码" prop="sendSite" align="center">
                <template slot-scope="scope">
                    {{ scope.row.sendSite ? scope.row.sendSite : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="补充信息" prop="sendStaff" align="center">
                <template slot-scope="scope">
                    {{ scope.row.sendStaff ? scope.row.sendStaff : '--' }}
                </template>
            </el-table-column>
            <el-table-column label="默认网点" prop="default" align="center" width="200px">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.hasDefault === 1">默认</el-tag>
                    <span v-else>--</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    {{ $moment(scope.row.createTime).format('Y-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark">
                <template slot-scope="scope">
                    <span :style="scope.row.status === 2 ? 'color: red' : ''">{{ scope.row.remark }}</span>
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
        <el-dialog title="网点信息" :visible.sync="addDialog" center @close="closeDialog" :close-on-click-modal="false">
            <div style="color: red;margin: 20px;font-size: 12px">
                如果尚未拥有账号，请联系附近合作的快递网点负责人进行申请， 这是部分<a target="_blank" href="https://www.yuque.com/kdnjishuzhichi/rg4owd"
                    >快递公司的电子面单账号申请教程</a
                >，仅供参考 请以您所合作的网点系统为准，建议您可以通过快递公司官方网站或客服查询附近网点的联系方式，以便尽快完成账号申请。
            </div>
            <el-form :model="addFrom" :rules="rule" ref="addFrom" label-width="120px">
                <el-form-item label="网点名称" prop="webPointName">
                    <el-input placeholder="请输入线下网点名称" v-model="addFrom.webPointName" size="mini"></el-input>
                </el-form-item>
                <el-form-item label="快递公司名称" prop="companyName">
                    <el-autocomplete
                        v-model="addFrom.companyName"
                        :fetch-suggestions="querySearchAsync"
                        placeholder="输入快递公司名称搜索"
                        @select="handleSelect"
                        size="mini"
                    ></el-autocomplete>
                    <a href="https://cloud.jdl.com/admin/#/appManager" v-if="addFrom.courierCompany === 'JD' || addFrom.courierCompany === 'JDKY'" target="_blank">
                        仅支持京东开放平台</a
                    >
                </el-form-item>

                <el-form-item label="快递公司编码" prop="courierCompany">
                    <el-input placeholder="" v-model="addFrom.courierCompany" disabled size="mini"></el-input>
                </el-form-item>
                <el-form-item label="是否默认网点" prop="hasDefault">
                    <el-switch v-model="addFrom.hasDefault" active-color="#13ce66" inactive-color="#95a5a6" :active-value="1" :inactive-value="0"> </el-switch>
                </el-form-item>
                <div style="color: red;margin: 20px;font-size: 12px">
                    如果不清楚下面内容该填写哪个，请参考<a target="_blank" href="https://www.yuque.com/kdnjishuzhichi/dfcrg1/hrfw43">电子面单账号对照表</a>填写
                </div>
                <el-form-item label="月结号(MonthCode)" label-width="180px">
                    <el-tooltip class="item" effect="dark" content="快递网点提供的月结账号，如顺丰的月结号" placement="top-start">
                        <el-input placeholder="请根据实际网点提供的月结号填写(没有可不填)" v-model="addFrom.monthCode" size="mini"></el-input>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="客户编码(CustomerName)" label-width="190px">
                    <el-tooltip class="item" effect="dark" content="快递网点提供，又称电子面单账号，客户账号，" placement="top-start">
                        <el-input placeholder="请根据实际网点提供的客户编码填写(没有可不填)" v-model="addFrom.customerName" size="mini"></el-input>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="客户密码(CustomerPwd)" label-width="180px">
                    <el-tooltip class="item" effect="dark" content="快递网点提供，又称打单密钥" placement="top-start">
                        <el-input placeholder="请根据实际网点提供的客户密码填写(没有可不填)" v-model="addFrom.customerPwd" size="mini"></el-input>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="网点编码(SendSite)" label-width="180px">
                    <el-input placeholder="请根据实际网点提供的网点编码填写(没有可不填)" v-model="addFrom.sendSite" size="mini"></el-input>
                </el-form-item>
                <el-form-item label="补充信息(SendStaff)" label-width="180px">
                    <el-input placeholder="请根据实际网点提供的信息填写(没有可不填)" v-model="addFrom.sendStaff" size="mini"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="save()">确 定</el-button>
            </span>
        </el-dialog>

        <!--默认发货地址弹框-->
        <el-dialog title="编辑默认发货地址" :visible.sync="addressDialog" width="520px" center @close="closeDialog" :close-on-click-modal="false">
            <el-form :model="addressFrom" :rules="addressRule" ref="addressFrom" label-width="120px" v-loading="addressFlag">
                <el-form-item label="省/市/区" prop="select">
                    <el-cascader v-model="addressFrom.select" :options="options" @change="changeAddress"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address">
                    <el-input placeholder="详细地址（只填省市区后面的详细地址即可）" v-model="addressFrom.address"></el-input>
                </el-form-item>
                <el-form-item label="发货人名称" prop="name">
                    <el-input placeholder="请输入发货人信息" v-model="addressFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="发货人联系方式" prop="phone" label-width="130px">
                    <el-input placeholder="请输入发货人联系方式" v-model="addressFrom.phone"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveAddress()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import area from '@/utils/area3.js';

export default {
    data() {
        return {
            labelPosition: 'top',
            addressFlag: false,
            options: this.transformAreaToOptions(area),
            addressDialog: false,
            addDialog: false,
            params: {
                pageNo: 1,
                pageSize: 10,
                isCount: true,
                type: 1,
                id: ''
            },
            list: [],
            total: 0,
            loading: false,
            addressFrom: {
                address: '',
                province: '',
                city: '',
                area: '',
                phone: '',
                name: '',
                select: []
            },
            addFrom: {
                hasDefault: 0,
                webPointName: '',
                companyName: '',
                courierCompany: '',
                monthCode: '',
                customerName: '',
                customerPwd: '',
                sendSite: '',
                sendStaff: ''
            },
            //订单发货
            deliveryData: {
                id: '',
                express: '',
                expressNum: ''
            },
            addressRule: {
                address: {
                    message: '请输入详细地址',
                    required: true
                },
                phone: {
                    message: '请输入联系方式',
                    required: true
                },
                name: {
                    message: '请输入名称',
                    required: true
                },
                select: {
                    message: '请选择省市区',
                    required: true
                }
            },
            rule: {
                webPointName: {
                    message: '请输入网点名称',
                    required: true
                },
                companyName: {
                    message: '请选择快递公司',
                    required: true
                },
                courierCompany: {
                    message: '请选择快递公司，将自动补全编码',
                    required: true
                }
            },

            statusList: [
                { id: 0, name: '待支付' },
                { id: 1, name: '待使用' },
                { id: 10, name: '待发货' },
                { id: 11, name: '待收货' },
                { id: 2, name: '待评价' },
                { id: 3, name: '已评价' },
                { id: -1, name: '已退款' },
                { id: -2, name: '已取消' }
            ],
            typeList: [
                { id: 1, name: '普通商品' },
                { id: 2, name: '秒杀商品' },
                { id: 3, name: '团购商品' }
            ]
        };
    },
    watch: {},
    created() {},
    mounted() {
        this.getList(1);
    },

    methods: {
        openAddress() {
            this.addressDialog = true;
            this.addressFlag = true;
            //获取默认地址
            this.$request.post({
                url: '/mt/defaultAddress/info',
                success: result => {
                    this.addressFlag = false;
                    if (result !== '操作成功') {
                        this.addressFrom = result;
                        this.addressFrom.select = [];
                        this.addressFrom.select[0] = result.province;
                        this.addressFrom.select[1] = result.city;
                        this.addressFrom.select[2] = result.area;
                    }

                    console.log('add:', this.addressFrom);
                },
                catch: e => {},
                finally: e => {
                    console.log('最终');
                }
            });
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
                                    value: area.county_list[countyCode]
                                };
                                city.children.push(county);
                            }
                        }

                        province.children.push(city);
                    }
                }

                options.push(province);
            }
            return options;
        },

        changeAddress(e, value) {
            console.log('地址：', value);
        },
        remove(id) {
            this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$request.post({
                    url: '/mt/dotCode/remove',
                    params: { id: id },
                    success: result => {
                        this.$message.success(result);
                        this.search();
                    }
                });
            });
        },
        openUpdate(row) {
            this.addDialog = true;
            this.addFrom = JSON.parse(JSON.stringify(row));
        },
        saveAddress() {
            this.$refs['addressFrom'].validate(valid => {
                if (!valid) {
                    return;
                }
                if (this.addressFrom.select.length !== 3) {
                    this.$message.warning('请完整选择省市区');
                    return;
                }
                this.addressFrom.province = this.addressFrom.select[0];
                this.addressFrom.city = this.addressFrom.select[1];
                this.addressFrom.area = this.addressFrom.select[2];
                delete this.addressFrom.select;
                delete this.addressFrom.updateTime;
                delete this.addressFrom.createTime;
                this.$request.post({
                    url: !this.addressFrom.id ? '/mt/defaultAddress/add' : '/mt/defaultAddress/edit',
                    params: this.addressFrom,
                    success: result => {
                        this.$message.success(result);
                        this.closeDialog();
                        this.search();
                        this.addressDialog = false;
                    }
                });
            });
        },
        save() {
            this.$refs['addFrom'].validate(valid => {
                if (!valid) {
                    return;
                }
                if (!this.addFrom.monthCode && !this.addFrom.customerName && !this.addFrom.customerPwd) {
                    this.$message.warning(' 月结号、客户编码、客户密码请根据实际网点给予的信息填写，至少填写一个');
                    return;
                }

                this.$request.post({
                    url: !this.addFrom.id ? '/mt/dotCode/add' : '/mt/dotCode/edit',
                    params: this.addFrom,
                    success: result => {
                        this.$message.success(result);
                        this.addDialog = false;
                        this.closeDialog();
                        this.search();
                    }
                });
            });
        },
        handleSelect(item) {
            console.log('item:', item);
            this.addFrom.courierCompany = item.courierCompany;
        },
        querySearchAsync(queryString, cb) {
            // if (!queryString) {
            //   queryString = "顺丰"
            // }
            this.$request.post({
                url: '/merchant/public/queryLikeByName',
                params: { keyword: queryString },
                success: result => {
                    var newArray = result.map(item => {
                        return { value: item.courierCompany, courierCompany: item.companyNumber };
                    });
                    cb(newArray);
                }
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
                webPointName: '',
                companyName: '',
                courierCompany: '',
                monthCode: '',
                customerName: '',
                customerPwd: '',
                sendSite: '',
                hasDefault: 0,
                sendStaff: ''
            };
            this.addressFrom = {
                address: '',
                province: '',
                city: '',
                area: '',
                phone: '',
                name: '',
                select: []
            };
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
                success: result => {
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
            this.$refs['refDelivery'].validate(valid => {
                if (valid) {
                    if (this.loading) {
                        return;
                    }
                    this.loading = true;
                    this.$request.post({
                        url: 'mt/order/delivery',
                        params: this.deliveryData,
                        success: res => {
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
            this.statusList.forEach(item => {
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
            return { class: statusClass, name };
        }
    },

    beforeDestroy() {}
};
</script>

<style></style>

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
