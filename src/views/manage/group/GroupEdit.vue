<template>
    <div class="">
        <div style="display: flex; align-items: center; justify-content: space-between">
            <div style="width: calc(100% - 70px)">
                <el-divider><b style="font-size: 18px">编辑团购活动</b> </el-divider>
            </div>
            <el-button type="primary" plain size="small" @click="$router.go(-1)">返回</el-button>
        </div>
        <el-form :model="formData" ref="formData" label-width="110px">
            <div class="tit">基本属性</div>
            <div class="basic basic_info">
                <div>
                    <el-form-item label="商品名">
                        <el-input size="small" v-model="formData.name" class="el-300"></el-input>
                    </el-form-item>
                    <el-form-item label="配送方式">
                        <el-checkbox-group v-model="formData.carriage" size="medium">
                            <el-checkbox :label="1" border>自提</el-checkbox>
                            <el-checkbox :label="2" border>外送</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <!-- <el-form-item label="商品分类">
                        <el-select v-model="formData.categoryId" size="small" disabled>
                            <el-option v-for="(item, index) in categoryList" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item> -->
                </div>
                <div>
                    <el-form-item label="商品原价" v-if="formData.isSpec == -1">
                        <el-input type="number" v-model="formData.originalPrice" class="el-300" size="small" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="商品拼团价" v-if="formData.isSpec == -1">
                        <el-input type="number" v-model="formData.price" class="el-300" size="small" onInput="value = value<1?1:(value>999999?999999:value)"></el-input>
                    </el-form-item>
                </div>
                <div>
                    <el-form-item label="商品库存" v-if="formData.isSpec == -1">
                        <el-input type="number" v-model="formData.stock" class="el-300" size="small" onInput="value = value<1?1:(value>999999?999999:value.replace(/[.]/g,''))"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="所属店铺">
                        <el-select v-model="formData.shopId" size="small" disabled>
                            <el-option v-for="(item, index) in shopList" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item> -->
                </div>
                <div>
                    <el-form-item label="活动时间" v-if="(type == 3 && formData.name) || type == 1">
                        <el-date-picker
                            ref="datePicker"
                            v-model="formData.timeArr"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            size="small"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="成团人数">
                        <el-input type="number" v-model="formData.buyCount" placeholder="多少个人才能拼成团" class="el-300" size="small"  onInput="value = value<1?1:(value>99?99:value.replace(/[.]/g,''))"></el-input>
                    </el-form-item>
                </div>
                <div>
                    <el-form-item label="拼团时间">
                        <el-input
                            type="number"
                            v-model="formData.groupPurchaseTime"
                            @input="groupPurchaseTime(formData.groupPurchaseTime)"
                            placeholder="拼团时间\单位(小时)"
                            class="el-300"
                            size="small"
                            onInput="value = value<1?1:(value>99?99:value.replace(/[.]/g,''))"
                        ></el-input>
                    </el-form-item>
                </div>
            </div>
            <div class="tit">图片上传</div>
            <div class="basic">
                <div>
                    <el-form-item label="商品封面图">
                        <el-image
                            style="width: 120px; height: 120px"
                            fit="cover"
                            class="el-defult"
                            :src="formData.cover | fullPath"
                            v-if="formData.cover.search(';base64') == -1 && formData.cover"
                        ></el-image>
                        <el-image style="width: 150px; height: 150px" fit="cover" class="el-defult" :src="formData.cover" v-if="formData.cover.search(';base64') != -1"></el-image>

                        <ImgCutter @onChooseImg="onChooseImg(2)" v-on:cutDown="cutDown" :sizeChange="false" :cutWidth="400" :cutHeight="400" :boxWidth="800" :boxHeight="700">
                            <el-button size="small" type="primary" slot="open">选择图片</el-button>
                        </ImgCutter>
                    </el-form-item>
                </div>
                <div>
                    <el-form-item label="商品轮播图">
                        <div v-for="(item, index) in banner" :key="index" class="cover">
                            <el-badge value="X" class="item" style="cursor: pointer" @click.native="delImg(index)">
                                <el-image style="width: 150px; height: 150px" fit="cover" class="el-defult" :src="item | fullPath"></el-image>
                            </el-badge>
                            <!-- <el-image style="width: 120px; height: 120px" fit="cover" class="el-defult" :src="item | fullPath"></el-image> -->
                        </div>
                        <ImgCutter @onChooseImg="onChooseImg(1)" v-on:cutDown="cutDown" :sizeChange="false" :cutWidth="400" :cutHeight="400" :boxWidth="800" :boxHeight="600">
                            <el-button size="small" type="primary" slot="open">选择图片</el-button>
                        </ImgCutter>
                    </el-form-item>
                </div>
            </div>
            <div class="tit" v-if="videoShow">视频上传</div>
            <div class="basic" v-if="videoShow">
                <div>
                    <el-form-item label="商品视频">
                        <div>
                            <el-button size="small" type="primary" @click="toFile">上传视频</el-button>
                            <el-button size="small" v-if="videoShow" type="danger" @click="delFile">删除视频</el-button>
                        </div>
                        <video class="video" controls v-if="videoShow" :src="videoShow" />
                        <input ref="videoFile" @change="fileChange($event)" type="file" id="video_file" accept="video/*" />
                    </el-form-item>
                </div>
            </div>
            <div class="tit">是否包邮</div>

            <div class="basic">
                <div>
                    <el-form-item label="是否包邮">
                        <el-switch v-model="isFreight" @change="isFreightTo0" active-text="是" inactive-text="否" active-value="0" inactive-value="1"></el-switch>
                    </el-form-item>
                </div>

                <div v-if="isFreight == 1">
                    <el-form-item label="邮费">
                        <el-input type="number" v-model="formData.freight" placeholder="请输入邮费金额" size="normal" clearable onInput="value = value<0?1:(value>999999?999999:value)"></el-input>
                    </el-form-item>
                </div>
            </div>
            <div class="tit">是否售后</div>

            <div class="basic">
                <div>
                    <el-form-item label="是否售后">
                        <el-switch v-model="formData.isAfterSell" active-text="是" inactive-text="否" active-value="1" inactive-value="0"></el-switch>
                    </el-form-item>
                </div>
            </div>
            <div class="tit">规格</div>
            <div class="basic">
                <div>
                    <el-form-item label="是否使用规格">
                        <el-switch v-model="formData.isSpec" active-text="使用" inactive-text="不使用" active-value="1" inactive-value="-1"></el-switch>
                    </el-form-item>
                </div>
                <div v-if="formData.isSpec == 1">
                    <div>
                        <el-button size="small" type="primary" plain @click="addSpecArr">添加规格组</el-button>
                        <SkuForm
                            v-if="sourceAttribute.length"
                            ref="skuForm"
                            :source-attribute="sourceAttribute"
                            :attribute.sync="attribute"
                            :structure="attribute.length == 0 ? structure1 : structure"
                            :sku.sync="skuList"
                        >
                            <template #cover="slotProps">
                                <el-image
                                    class="el-defult"
                                    :src="slotProps.row.cover | fullPath"
                                    v-if="slotProps.row.cover && slotProps.row.cover.search(';base64') == -1"
                                ></el-image>
                                <el-image
                                    width="150px"
                                    height="150px"
                                    class="el-defult"
                                    :preview-src-list="[formData.cover]"
                                    :src="slotProps.row.cover"
                                    v-if="slotProps.row.cover && slotProps.row.cover.search(';base64') != -1"
                                ></el-image>
                                <ImgCutter @onChooseImg="onChooseImg(3, slotProps.$index)" v-on:cutDown="cutDown" :cutWidth="192" :cutHeight="192" :boxWidth="700" :boxHeight="400">
                                    <el-button size="small" type="primary" slot="open">选择图片</el-button>
                                </ImgCutter>
                            </template>
                        </SkuForm>
                    </div>
                </div>
            </div>

            <div class="tit">商品描述</div>
            <div class="basic">
                <div>
                    <editor :isClear="true" style="width:420px" :value.sync="formData.description" uploadUrl="/api/mt/pro/public/proUpload"></editor>
                </div>
            </div>
        </el-form>
        <div class="handle">
            <el-button type="primary" @click="toSubmit" :loading="loading">确认提交</el-button>
            <el-button @click="$router.go(-1)">返回</el-button>
        </div>
    </div>
</template>

<script>
import SkuForm from 'vue-sku-form';
import { VueCropper } from 'vue-cropper';
import editor from '@/components/editor/CustomWangEditor';
import common from '@/utils/common.js';
export default {
    components: {
        VueCropper,
        SkuForm,
        editor
    },
    data() {
        return {
            loging: false,
            ProDetail: {},
            id: '',
            type: 1,
            banner: [],
            loading: false,
            formData: {
                banner: [],
                cover: '',
                video: '',
                description: '',
                name: '', //商品名
                firmPrice: 0,
                categoryId: '',
                carriage: '1',
                isSpec: '-1',
                status: '2',
                stock: '',
                skuList: [], //模型组
                originalPrice: '',
                price: '',
                timeArr: [],
                buyCount: '', //拼团人数
                groupPurchaseTime: '', //拼团时间
                freight: 0,
                isAfterSell: ''
            },
            isFreight: '',
            structure1: [
                {
                    name: 'rioPrice',
                    type: 'slot',
                    label: '请添加规格'
                }
            ],
            structure: [
                { name: 'rioPrice', type: 'input', label: '原价' },
                { name: 'curPrice', type: 'input', label: '现价' },
                { name: 'stock', type: 'input', label: '库存' },
                { name: 'remark', type: 'input', label: '描述' },
                { name: 'cover', type: 'slot', defaultValue: '', label: '封面图' }
            ],
            sourceAttribute: [], //所有的规格项目
            attribute: [], //选中的规格项目
            skuList: [], //生成的sku
            shopList: [],
            categoryList: [{ name: 'ghhgh', id: 1 }],
            imgType: '',
            imgIndex: '',
            videoShow: ''
        };
    },
    created() {},
    mounted() {
        let id = this.$route.query.id;
        let type = this.$route.query.type || 1;
        if (id) {
            this.id = id;
            this.type = type;
            this.getDetail();
        }
        this.getShop();
        this.getCategory();
    },
    watch: {},
    methods: {
        // 限制拼团时间
        groupPurchaseTime(value){
            console.log(value);
            this.formData.groupPurchaseTime=this.formData.groupPurchaseTime.replace(/[.]/g,'')
            if(value<1||value[0]==0)this.formData.groupPurchaseTime=1;
        },
        // 是否包邮
        isFreightTo0() {
            this.formData.freight = 0;
        },
        // 提交
        toSubmit() {
            if (!this.formData.name) {
                this.$message.error('请输入商品名称');
                return;
            }
            // if (!this.formData.categoryId) {
            //     this.$message.error('请选择商品分类');
            //     return;
            // }
            //有规格时，获取数据，无规格改为空
            if (this.formData.isSpec == 1) {
                if (this.skuList.length == 0 || this.attribute.length == 0) {
                    this.$message.warning('至少填写一个规格');
                    return;
                }
                this.skuList.forEach((item) => {
                    if (!item.stock) return this.$message.warning('请输入规格库存');
                    if (!item.rioPrice) return this.$message.warning('请输入规格价格');
                    if (!item.curPrice) return this.$message.warning('请输入规格价格');
                    // if (!item.cover) return this.$message.warning('请上传规格图片');
                    if (!item.remark) return this.$message.warning('请输入规格描述');
                });
                let skuList = JSON.parse(JSON.stringify(this.skuList));
                for (let i in skuList) {
                    skuList[i].sku = skuList[i].sku.split(';');
                    let obj = {};
                    for (let j in skuList[i].sku) {
                        obj[this.attribute[j].name] = skuList[i].sku[j];
                    }
                    skuList[i].spec = obj;
                }
                this.formData.originalPrice = '';
                this.formData.price = '';
                this.formData.friendPrice = '';
                this.formData.stock = '';
                this.formData.skuList = JSON.stringify(skuList);
            } else {
                this.formData.skuList = '';
                // 判断库存跟价格是否为空
                if (!this.formData.originalPrice || !this.formData.spikePrice || !this.formData.stock) return this.$message.error('请输入原价现价、价格和库存');
            }
            if (!this.formData.carriage[0]) return this.$message.error('请选择配送方式');

            if (!this.formData.shopId) return this.$message.error('请选择所属店铺');
            if (!this.formData.timeArr.length > 0) return this.$message.error('请填写活动时间');
            if (!this.formData.buyCount) return this.$message.error('请填写单人限购数量');
            if (!this.formData.cover) return this.$message.error('请上传封面图');
            if (this.banner.length == 0) return this.$message.error('请上传轮播图');
            if (!this.formData.description) return this.$message.error('请编辑商品详情');
            if (!this.formData.groupPurchaseTime && this.formData.groupPurchaseTime <= 0) return this.$message.error('请输入拼团时间');
            this.loading = true;
            let banner = JSON.parse(JSON.stringify(this.banner));
            this.formData.banner = JSON.stringify(banner);
            let formData = new FormData();

            if (this.id && this.type == 1) formData.append('proId', this.id);
            if (this.id && this.type == 3) formData.append('id', this.id);
            formData.append('name', this.formData.name);
            formData.append('video', this.formData.video);
            formData.append('startTime', this.formData.timeArr[0]);
            formData.append('endTime', this.formData.timeArr[1]);
            formData.append('buyCount', this.formData.buyCount);
            formData.append('categoryId', this.formData.categoryId);
            formData.append('carriage', JSON.stringify(this.formData.carriage));
            formData.append('shopId', this.formData.shopId);
            formData.append('status', this.formData.status);
            formData.append('originalPrice', this.formData.originalPrice);
            formData.append('price', this.formData.price);
            formData.append('groupPurchaseTime', this.formData.groupPurchaseTime);
            formData.append('spikePrice', this.formData.spikePrice);
            formData.append('freight ', this.formData.freight);

            formData.append('stock', this.formData.stock);
            formData.append('isSpec', this.formData.isSpec);
            formData.append('cover', this.formData.cover);
            formData.append('banner', this.formData.banner);
            formData.append('description', this.formData.description);
            formData.append('isAfterSell ', this.formData.isAfterSell);

            if (this.formData.isSpec == 1) formData.append('skuList', this.formData.skuList);
            this.$request.post({
                url: '/mt/group/pro/setGroupBuy',
                params: formData,
                success: (res) => {
                    if (this.type == 1) this.$message.success('添加成功');
                    if (this.type == 3) this.$message.success('修改成功');
                    this.$router.go(-1);
                },
                finally: (res) => {
                    this.formData.banner = JSON.parse(this.formData.banner);
                    this.loading = false;
                }
            });
        },

        // 获取普通详情
        getDetail() {
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            let url;
            if (this.type == 3) {
                url = '/mt/group/pro/detail';
            } else {
                url = '/mt/pro/detail';
            }

            this.$request.post({
                url,
                params: {
                    id: this.id
                },
                success: (res) => {
                    if (this.type == 3) {
                        this.formData.cover = res.pro.avatar; // 主图
                        this.formData.banner = res.pro.imgs.split(','); // 轮播图
                        this.banner = res.pro.imgs.split(','); // 轮播图
                        this.formData.description = res.pro.content; // 富文本
                        this.formData.timeArr[0] = common.getDate(res.pro.openGroupTime) + ''; // 开始时间
                        this.formData.timeArr[1] = common.getDate(res.pro.overGroupTime) + ''; // 结束时间
                        this.formData.buyCount = res.pro.pepoleCount; // 拼团人数
                        this.formData.groupPurchaseTime = res.pro.groupPurchaseTime; // 拼团时间
                        this.formData.originalPrice = res.pro.proPrice; // 商品原价
                        this.formData.price = res.pro.price; // 商品原价

                        this.formData.categoryId = res.pro.categoryId;
                        this.formData.firmPrice = res.pro.friendPrice;
                        this.formData.isSpec = res.pro.isSpec + '';
                        this.formData.name = res.pro.title;
                    } else {
                        this.formData.cover = res.pro.cover;
                        this.formData.banner = res.pro.banner.split(',');
                        this.banner = res.pro.banner.split(',');
                        this.formData.name = res.pro.name;
                        this.formData.originalPrice = res.pro.price;
                        this.formData.description = res.pro.description;
                    }
                    // if (res.pro.video) {
                    //     this.formData.video = res.pro.video;
                    //     this.videoShow = this.$envConfig.serviceUrl + res.pro.video;
                    // }
                    this.formData.id = res.pro.id; // 拼团id
                    this.ProDetail = res.pro;
                    this.formData.carriage = JSON.parse(res.pro.carriage);
                    this.formData.isAfterSell = res.pro.isAfterSell == 1 ? '1' : '0';
                    this.formData.status = res.pro.status + '';
                    this.formData.shopId = res.pro.shopId;
                    this.formData.spikePrice = res.pro.price;
                    this.formData.stock = res.pro.stock;
                    this.formData.merchantId = res.pro.merchantId + '';
                    this.formData.firmPrice = res.pro.friendPrice;
                    this.formData.isSpec = res.pro.isSpec + '';
                    this.formData.categoryId = res.pro.categoryId;
                    this.isFreight = res.pro.freight > 0 ? '1' : '0';
                    this.formData.freight = res.pro.freight;
                    this.getSku();
                },
                finally: (err) => {
                    loading.close();
                }
            });
        },
        getSku() {
            this.$request.post({
                url: 'mt/pro/selectProSku',
                params: {
                    proId: this.type == 3 ? this.ProDetail.proId : this.id,
                    type: this.type
                },
                success: (result) => {
                    this.setSkuList(result);
                }
            });
        },
        setSkuList(result) {
            this.skuList = [];
            for (var item of result) {
                var spec = JSON.parse(item.spec);
                var sku = '';

                for (let key in spec) {
                    sku += spec[key] + ';';
                    let flag = -1;
                    for (let index in this.sourceAttribute) {
                        if (this.sourceAttribute[index].name == key) {
                            flag = index;
                        }
                    }
                    if (flag == -1) {
                        this.sourceAttribute.push({
                            item: [spec[key]],
                            name: key
                        });
                    } else {
                        if (
                            this.sourceAttribute[flag].item.filter((name) => {
                                return name == spec[key];
                            }).length == 0
                        ) {
                            this.sourceAttribute[flag].item.push(spec[key]);
                        }
                    }
                }
                sku = sku.slice(0, sku.length - 1);

                this.skuList.push({
                    cover: item.cover,
                    originalPrice: item.originalPrice,
                    firmPrice: item.firmPrice,
                    rioPrice: item.rioPrice,
                    curPrice: item.curPrice,
                    id: item.id,
                    proId: item.proId,
                    remark: item.remark,
                    sku: sku,
                    stock: item.stock
                });
            }
            this.attribute = this.sourceAttribute;
            this.$refs.skuForm.init();
        },
        // ---------------------------------------轮播图相关------------------------------
        delImg(index) {
            this.banner.splice(index, 1);
        },
        cutDown(e) {
            if (this.imgType == 1) {
                this.banner.push(e.dataURL);
            } else if (this.imgType == 2) {
                this.formData.cover = e.dataURL;
            } else {
                if (this.skuList.length != 0) {
                    console.log(this.$refs);
                    this.skuList[this.imgIndex].cover = e.dataURL;
                    this.$refs.skuForm.init();
                }
            }
        },
        onChooseImg(imgType, index) {
            // 判断是不是规格内的图片,是的话要记录type跟index
            this.imgType = imgType;
            if (index == 0 || index) {
                this.imgIndex = index;
            } else {
                this.imgIndex = '';
            }
        },
        // ----------------------------------------视频相关---------------------------
        toFile() {
            this.$refs.videoFile.click();
        },
        delFile() {
            this.videoShow = '';
            this.formData.video = '';
        },
        fileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            let name = files[0].name.toLowerCase();
            if (!/\.(avi|wmv|mpeg|mp4|mov|mkv|flv|f4v|m4v|rmvb|rm|3gp|dat|ts|mts|vob)$/.test(name)) {
                this.$message.warning('请上传视频');
                return;
            }
            if (files[0].size > 1024 * 1024 * 20) {
                this.$message.warning('视频大小不能大于20M');
                return;
            }
            this.formData.video = files[0];
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = () => {
                this.videoShow = reader.result;
            };
        },

        // 获取全部分类
        getCategory() {
            this.$request.post({
                url: 'merchant/public/proCategoryList',
                success: (res) => {
                    this.categoryList = res;
                }
            });
        },
        // 获取全部店铺
        getShop() {
            this.$request.post({
                url: 'mt/shop/curMerchantList',
                success: (res) => {
                    this.shopList = res;
                }
            });
        },

        // 添加规格组
        addSpecArr() {
            this.$prompt('请输入规格组名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            })
                .then(({ value }) => {
                    let status = false;
                    if (!value) {
                        this.$message.error('请输入规格组名');
                        return;
                    }
                    for (let i of this.sourceAttribute) {
                        if (i.name == value) {
                            status = true;
                        }
                    }
                    if (!status) {
                        this.sourceAttribute.push({ name: value, item: [] });
                        this.$refs.skuForm.init();
                    } else {
                        this.$message.error('已存在相同规格组');
                    }
                })
                .catch(() => {});
        }
    }
};
</script>

<style>
.basic_info .el-input--small .el-input__inner {
    width: 215px;
}
.el-input-group__append button{
    padding: 0;
}
</style>

<style scoped>
.tit {
    border-left: 7px solid #409eff;
    padding-left: 10px;
    font-size: 18px;
    margin-bottom: 20px;
}

.basic {
    margin-bottom: 40px;
}

.basic > div {
    width: 1000px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.edui-default .edui-editor {
    z-index: 0 !important;
}
.edui-default .edui-toolbar .edui-combox .edui-combox-body {
    height: 20px;
}
.sku-container .sku-check .theme-1 {
    justify-content: start !important;
}
.sku-container .sku-check .theme-1 .item {
    width: 20% !important;
    margin-right: 10px;
}
.sku-container {
    width: 1245px !important;
}
.cover {
    display: inline-block;
    margin-right: 20px;
}
video {
    width: 200px;
    height: 100px;
    vertical-align: top;
}
#video_file {
    display: none;
}
.handle {
    background: #f5f5f5;
    padding: 20px;
    text-align: center;
}
</style>
