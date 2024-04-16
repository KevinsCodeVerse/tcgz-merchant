
<!--
 * @Author: your name
 * @Date: 2020-11-10 09:47:16
 * @LastEditTime: 2020-11-26 15:47:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \party\src\views\manage\good\Add.vue
-->
<template>
    <div class="">
        <el-form :model="formData" ref="formData" label-width="110px">
            <div class="tit">商品基本属性</div>
            <div class="basic basic_info">
                <div>
                    <el-form-item label="商品名">
                        <el-input type='text' size="small" v-model="formData.name"  class="el-300" show-word-limit maxlength="20"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类">
                        <el-select v-model="formData.categoryId" size="small">
                            <el-option v-for="(item, index) in categoryList" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div>
                    <el-form-item label="商品原价" v-if="formData.isSpec == -1" >
                        <el-input type="number" v-model="formData.oriPrice" class="el-300" show-word-limit maxlength="8" size="small" onInput="value = value<1?1:(value>999999?999999:value)" ></el-input>
                    </el-form-item>
                    <el-form-item label="商品现价" v-if="formData.isSpec == -1" >
                        <el-input type="number" v-model="formData.curPrice"  class="el-300" show-word-limit maxlength="8" size="small" onInput="value = value<1?1:(value>999999?999999:value)"></el-input>
                    </el-form-item>
                </div>
                <div>
                    <!-- <el-form-item label="商品老乡价" v-if="formData.isSpec == -1">
                        <el-input type="number" v-model="formData.firmPrice" class="el-300" size="small"></el-input>
                    </el-form-item> -->
                    <el-form-item label="商品库存" v-if="formData.isSpec == -1" >
                        <el-input type="number" v-model="formData.stock" class="el-300" show-word-limit maxlength="6" size="small" onInput="value = value<1?1:(value>999999?999999:value.replace(/[.]/g,''))"></el-input>
                    </el-form-item>
                    <el-form-item label="所属店铺">
                        <el-select v-model="formData.shopId" size="small">
                            <el-option v-for="(item, index) in shopList" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div>
                    <el-form-item label="商品状态">
                        <el-radio-group v-model="formData.status">
                            <!-- <el-radio label="0">审核</el-radio> -->
                            <el-radio label="1">上架</el-radio>
                            <el-radio label="2">下架</el-radio>
                            <!-- <span v-if="formData.status==-1">审核失败</span> -->
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="配送方式">
                        <el-checkbox-group v-model="formData.carriage" size="medium">
                            <el-checkbox :label="1" border>自提</el-checkbox>
                            <el-checkbox :label="2" border>外送</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </div>
                <div></div>
            </div>
            <div class="tit">图片上传</div>
            <div class="basic">
                <div>
                    <el-form-item label="商品封面图">
                        <el-image
                            style="width: 150px; height: 150px"
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
                        </div>
                        <ImgCutter @onChooseImg="onChooseImg(1)" v-on:cutDown="cutDown" :sizeChange="false" :cutWidth="400" :cutHeight="400" :boxWidth="800" :boxHeight="600">
                            <el-button size="small" type="primary" slot="open">选择图片</el-button>
                        </ImgCutter>
                    </el-form-item>
                </div>
            </div>
            <div class="tit">视频上传</div>
            <div class="basic">
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
            <div class="tit">分销推广</div>
            <div class="basic">
                <div>
                    <el-form-item label="是否推广">
                        <el-tooltip
                            class="item"
                            effect="dark"
                            :content="$store.state.use.use['4'] != 1 ? '您未开通分销推广或已过期!' : '开启分销推广服务之前请先配置佣金比例!'"
                            placement="top-end"
                        >
                            <el-switch
                                v-model="formData.isInvite"
                                active-text="使用"
                                inactive-text="不使用"
                                active-value="1"
                                inactive-value="0"
                                :disabled="$store.state.use.use['4'] != 1"
                            ></el-switch>
                        </el-tooltip>
                    </el-form-item>
                </div>
                
                <!-- <div v-if="formData.isInvite == 1&&$store.state.use.use['4']==1">
                    <el-form-item label="直推佣金">
                        <el-input v-model="formData.directReward" placeholder="请输入直推佣金金额" size="normal" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="间推佣金">
                        <el-input v-model="formData.indirectReward" placeholder="请输入间推佣金金额" size="normal" clearable></el-input>
                    </el-form-item>
                </div> -->
            </div>
            <div class="tit">是否包邮</div>

            <div class="basic">
                <div>
                    <el-form-item label="是否包邮">
                        <el-switch
                                v-model="isFreight"
                                @change="isFreightTo0"
                                active-text="是"
                                inactive-text="否"
                                active-value="0"
                                inactive-value="1"
                            ></el-switch>
                    </el-form-item>
                </div>
                
                <div v-if="isFreight == 1">
                    <el-form-item label="邮费">
                        <el-input  type="number" v-model="formData.freight" placeholder="请输入邮费金额" size="normal" clearable  onInput="value = value<0?1:(value>999999?999999:value)" maxlength="5"></el-input>
                    </el-form-item>
                </div>
            </div>
            <div class="tit">是否售后</div>

            <div class="basic">
                <div>
                    <el-form-item label="是否售后">
                        <el-switch
                                v-model="formData.isAfterSell"
                                active-text="是"
                                inactive-text="否"
                                active-value="1"
                                inactive-value="0"
                            ></el-switch>
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
                        <SkuForm v-if="sourceAttribute.length" ref="skuForm" :source-attribute="sourceAttribute" :attribute.sync="attribute" :structure="attribute.length==0?structure1:structure" :sku.sync="skuList">
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
            <el-button type="primary" @click="toSubmit" :loading="loading">{{ formData.id ? '修改' : '添加' }}</el-button>
        </el-form>
    </div>
</template>

<script>
import SkuForm from 'vue-sku-form';
import { VueCropper } from 'vue-cropper';
import editor from '@/components/editor/CustomWangEditor';
export default {
    components: {
        VueCropper,
        SkuForm,
        editor
    },
    name:"addOrUpdate",
    data() {
        return {
            id: '',
            banner: [],
            loading: false,
            formData: {
                banner: [],
                cover: '',
                description: '',
                name: '',
                firmPrice: 0,
                categoryId: '',
                carriage: [],
                isSpec: '-1',
                status: '2',
                stock: '',
                skuList: [], //模型组
                oriPrice: '',
                curPrice: '',
                firmPrice: '',
                description: '',
                directReward: '',
                indirectReward: '',
                freight:0,
                isAfterSell:''
            },
            isFreight:"",
             structure1: [{
                 name: 'rioPrice',
                    type: 'slot',
                    label: '请添加规格'
             }],
            structure: [
                {
                    name: 'rioPrice',
                    type: 'input',
                    label: '原价'
                },
                {
                    name: 'curPrice',
                    type: 'input',
                    label: '现价'
                },
                // {
                //     name: 'firmPrice',
                //     type: 'input',
                //     label: '老乡价'
                // },
                {
                    name: 'stock',
                    type: 'input',
                    label: '库存'
                },
                {
                    name: 'remark',
                    type: 'input',
                    label: '描述'
                },
                {
                    name: 'cover',
                    type: 'slot',
                    defaultValue: '',
                    label: '封面图'
                },
                {
                    name: 'type',
                    type: 'slot',
                    defaultValue: '1'
                }
            ], //自定义字段
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
    created() {
        var id = this.$route.query.id;
        if (id) {
            this.id = id;
            this.getDetail();
        }
    },
    mounted() {
        this.getShop();
        this.getCategory();
    },
    watch: {},
    methods: {
        // 是否包邮
        isFreightTo0(){
            this.formData.freight = 0;
        },
        // 测试
        测试() {
            console.log(this.formData);
        },

        // 提交
        toSubmit() {
            if (!this.formData.name) {
                this.$message.error('请输入商品名称');
                return;
            }
            if (!this.formData.categoryId) {
                this.$message.error('请选择商品分类');
                return;
            }
            //有规格时，获取数据，无规格改为空
            if (this.formData.isSpec == 1) {
                if (this.skuList.length == 0 || this.attribute.length == 0) {
                    this.$message.warning('至少填写一个规格');
                    return;
                }
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
                if (!this.formData.oriPrice || !this.formData.curPrice || !this.formData.stock) return this.$message.error('请输入原价现价、价格和库存');
            }
            if (!this.formData.carriage[0]) return this.$message.error('请选择配送方式');
            if (!this.formData.shopId) return this.$message.error('请选择所属店铺');
            if (!this.formData.cover) return this.$message.error('请上传封面图');
            if (this.banner.length == 0) return this.$message.error('请上传轮播图');
            if (!this.formData.description) return this.$message.error('请编辑商品详情');
            if (this.isFreight==1&&!this.formData.freight) return this.$message.error('请输入邮费');
            if (this.banner.length>7) return this.$message.error('轮播图不能上传超过7张');
            if (this.loading) return;
            this.loading = true;
            let banner = JSON.parse(JSON.stringify(this.banner));
            this.formData.banner = JSON.stringify(banner);
            let formData = new FormData();
            if (this.formData.id) {
                formData.append('id', this.formData.id);
            }
            
            formData.append('name', this.formData.name);
            formData.append('video', this.formData.video||'');
            formData.append('cover', this.formData.cover);
            formData.append('banner', this.formData.banner);
            formData.append('categoryId', this.formData.categoryId);
            formData.append('shopId', this.formData.shopId);
            formData.append('status', this.formData.status);
            formData.append('oriPrice', this.formData.oriPrice);
            formData.append('curPrice', this.formData.curPrice);
            formData.append('firmPrice', this.formData.firmPrice);
            formData.append('stock', this.formData.stock);
            formData.append('isSpec', this.formData.isSpec);
            formData.append('isInvite ', this.formData.isInvite);
            formData.append('freight ', this.formData.freight);
            formData.append('isAfterSell ', this.formData.isAfterSell);
            formData.append('directReward', this.formData.directReward || '');
            formData.append('indirectReward', this.formData.indirectReward || '');
            formData.append('carriage', JSON.stringify(this.formData.carriage));

            if (this.formData.isSpec == 1) {
                formData.append('skuList', this.formData.skuList);
            }
            formData.append('description', this.formData.description);
            this.$request.post({
                url: 'mt/pro/saveOrUpdate',
                params: formData,
                success: (res) => {
                   this.formData.id?this.$message.success('修改成功'):this.$message.success('添加成功');
                        
                    this.$router.back();
                },
                finally: (res) => {
                    this.formData.banner = JSON.parse(this.formData.banner);
                    this.loading = false;
                }
            });
        },

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
        getDetail() {
            this.$request.post({
                url: 'mt/pro/detail',
                params: {
                    id: this.id
                },
                success: (res) => {
                    this.formData.id = res.pro.id;
                    this.formData.cover = res.pro.cover;
                    this.formData.banner = res.pro.banner.split(',');
                    this.banner = res.pro.banner.split(',');
                    this.formData.isSpec = res.pro.isSpec + '';
                    this.formData.name = res.pro.name;
                    this.formData.merchantId = res.pro.merchantId + '';
                    this.formData.oriPrice = res.pro.originalPrice;
                    this.formData.curPrice = res.pro.price;
                    this.formData.shopId = res.pro.shopId;
                    this.formData.stock = res.pro.stock;
                    this.formData.isAfterSell = res.pro.isAfterSell==1?'1':'0';
                    this.formData.status = res.pro.status + '';
                    this.formData.description = res.pro.description;
                    this.formData.isInvite = res.pro.isInvite + '';
                    this.formData.indirectReward = res.pro.indirectReward;
                    this.formData.directReward = res.pro.directReward;
                    this.formData.freight = res.pro.freight;
                    this.formData.carriage = JSON.parse(res.pro.carriage);
                    this.isFreight = res.pro.freight>0?'1':'0';
                    this.formData.categoryId = res.pro.categoryId;

                    if (res.pro.video != null) {
                        this.formData.video = res.pro.video;
                        this.videoShow = this.$envConfig.serviceUrl + res.pro.video;
                    }

                    this.getSku();
                }
            });
        },
        getSku() {
            this.$request.post({
                url: 'mt/pro/selectProSku',
                params: {
                    proId: this.id,
                    type:1,
                },
                success: (result) => {
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
                            curPrice: item.curPrice,
                            firmPrice: item.firmPrice,
                            rioPrice: item.rioPrice,
                            id: item.id,
                            proId: item.proId,
                            remark: item.remark,
                            sku: sku,
                            stock: item.stock
                        });
                    }
                    this.attribute = this.sourceAttribute;
                    this.$refs.skuForm.init();
                }
            });
        },
        // 视频相关
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
</style>
