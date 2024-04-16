<template>
    <div class="addorupdate">
        <div class="add_form">
            <el-form v-loading="loading" ref="form" :model="form" label-width="80px">
                <el-form-item label="店铺名称">
                    <el-input v-model="form.name" placeholder="请输入店铺名称"></el-input>
                </el-form-item>
                <el-form-item label="店铺分类">
                    <el-select v-model="form.categoryId" placeholder="请选择店铺分类">
                        <el-option
                        v-for="item in categoryList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="店铺简介">
                    <el-input type="textarea" :rows="3" v-model="form.overview" placeholder="请输入店铺简介"></el-input>
                </el-form-item>
                <el-form-item label="店铺头像">
                    <ImgCutter
                        v-on:cutDown="cutDown"
                        :sizeChange="false"
                        :cutWidth="400"
                        :cutHeight="400"
                        :boxWidth="600"
                        :boxHeight="400"
                    >
                        <div slot="open" class="select_mode" style="height:120px;width:120px;">
                            <img v-if="form.shopPhoto" class="avatar_show" :src="form.shopPhoto" width="100%" height="100%"/>
                            <img v-else class="select" :src="selectImg " width="50%"/>
                        </div>
                    </ImgCutter>
                </el-form-item>
                <el-form-item label="店铺热线">
                    <el-input v-model="form.phone" placeholder="请输入店铺热线"></el-input>
                </el-form-item>
                <el-form-item label="店铺海报">
                    <upload ref="banner" :limit_size="1" />
                </el-form-item>
                <el-form-item label="营业时间">
                    <el-time-picker
                    is-range
                    arrow-control
                    v-model="businessHours"
                    value-format="HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    placeholder="选择时间范围">
                </el-time-picker>
                </el-form-item>
                <el-form-item label="详细地址">
                    <el-input v-model="form.address" placeholder="请输入详细地址" @change="addrChange"></el-input>
                    <el-button @click="codeAddress">查看地图</el-button>
                    <div v-show="mapShow" class="map_body" ref="map"></div>
                </el-form-item>
                <el-form-item label="详细介绍">
                   <div class="basic">
                       <div>
                        <editor :isClear="true" :value.sync="form.content" uploadUrl="/api/mt/shop/public/shopUpload"></editor>
                        </div>
                   </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addOrUpdate">{{this.form.id?'立即修改':'立即创建'}}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <canvas id="my_canvas" width="200" height="200"></canvas>
        <img id="location_img" src="@/assets/img/location.png" alt="">
    </div>
</template>

<script>
//引入地图js
import { TMap } from "@/utils/TMap";
import upload from '@/components/upload/Upload';
import editor from "@/components/editor/CustomWangEditor";
import selectImg from "@/components/upload/img/selectedImg.png";
export default {
    name: '',
    components: {
        upload,
        editor
    },
    data() {
        return {
            loading: false,
            form: {
                shopPhoto: '',
                longitude: "39.916527", //经度
                latitude: "116.397128", //维度
            },
            mapShow: false,
            categoryList: [],
            businessHours: ['00:00:00','23:59:59'],
            selectImg: selectImg,
            icon: ''
        }
    },
    created(){
        
    },
    mounted(){
        let id = this.$route.query.id;
        if(id) {
            var info = JSON.parse(sessionStorage.getItem('shopItem'));
            this.form = info;
            delete this.form.createTime;
            if(this.form.startTime) {
                this.businessHours = [this.form.startTime,this.form.endTime];
            }
            if(this.form.banner) {
                this.$refs.banner.path_list.push({
                    path: this.form.banner
                })
            }
        }
        this.getCategory();
        this.TencentMap();
    },
    watch: {},
    methods: {
        async addOrUpdate() {
            if(!this.form.name) {
                this.$message.warning('请输入店铺名称');
                return;
            }
            if(!this.form.categoryId) {
                this.$message.warning('请选择店铺分类');
                return;
            }
            if(!this.form.overview) {
                this.$message.warning('请输入店铺简介');
                return;
            }
            if(!this.form.shopPhoto) {
                this.$message.warning('请上传店铺头像');
                return;
            }
            if(!this.form.phone) {
                this.$message.warning('请输入店铺热线');
                return;
            }
            var banner = this.$refs.banner.path_list[0];
            if(!banner) {
                this.$message.warning('请选择封面');
                return;
            }
            if(this.businessHours.length < 2) {
                this.$message.warning('请选择营业时间');
                return;
            }
            if(!this.form.address) {
                this.$message.warning('请输入详细地址');
                return;
            }
            if(!this.form.content) {
                this.$message.warning('请编辑内容');
                return;
            }
            if(this.loading) return;
            this.loading = true;
            this.form.icon = await this.createLocation();

            if(banner.path.indexOf('base64') != -1) {
                this.form.banner = banner.path;
            }
            this.form.startTime = this.businessHours[0];
            this.form.endTime = this.businessHours[1];
            this.form.status = 1;
            this.$request.post({
                 url: "mt/shop/saveOrUpdate",
                 params: this.form,
                 success: result => {
                     this.$message.success('操作成功');
                     this.$router.push('/shop/list');
                 },
                 finally: () => {
                      this.loading = false;
                 },
            });
        },
        createLocation() {
            return new Promise((resolve, reject) => {
                let c = document.querySelector('#my_canvas');
                let ctx = c.getContext("2d");
                let img = document.getElementById('location_img');
                ctx.drawImage(img,0,0,200,200)
                ctx.save();
                ctx.beginPath();
                ctx.arc(97,82,60,0,2*Math.PI);
                ctx.fill();
                ctx.clip();
                let avatarImg = document.querySelector('.avatar_show')
                avatarImg.crossOrigin = '';
                avatarImg.setAttribute("crossOrigin",'anonymous');
                avatarImg.onload = ()=>{
                    ctx.drawImage(avatarImg,37,22,120,120)
                    ctx.restore();
                    resolve(c.toDataURL('image/png'))
                }
            })
        },
        cutDown(e) {
            // this.form.shopPhoto = e.dataURL;
            this.$set(this.form,'shopPhoto', e.dataURL)
        },
        // 地址改变
        addrChange(data) {
            if(window.addrTime) {
                clearTimeout(window.addrTime);
            }
            setTimeout(() => {
                this.geocoder.getLocation(this.form.address);
            },1000);
            
        },
        // 获取全部分类
        getCategory() {
            this.$request.post({
                url: 'merchant/public/shopCategoryList',
                success: res => {
                    this.categoryList = res;
                },
            });
        },
        //创建地图
        TencentMap() {
            //这里填自己的key
            TMap("BIEBZ-KBNRD-FII4L-PUKSS-I5YZE-AUF3J").then((qq) => {
                //地图经纬赋值
                const myLatlng = new qq.maps.LatLng(
                    this.form.longitude,
                    this.form.latitude
                );
                const map = new qq.maps.Map(this.$refs.map, {
                    center: myLatlng, //位置
                    zoom: 13, //放大程度
                    mapTypeId: qq.maps.MapTypeId.ROADMAP,
                });
                //地址和经纬度之间进行转换服务
                this.geocoder = new qq.maps.Geocoder();
                //设置服务请求成功的回调函数
                this.geocoder.setComplete(result => {
                    console.log(result)
                    this.form.cityName = result.detail.addressComponents.province + result.detail.addressComponents.city;
                    this.form.latitude = result.detail.location.lat;
                    this.form.longitude = result.detail.location.lng;
                    map.setCenter(result.detail.location);
                    var marker = new qq.maps.Marker({
                        map: map,
                        position: result.detail.location,
                    });
                    //监听回调函数并将返回的经纬度赋值到数据上
                    qq.maps.event.addListener(marker, "click", function (event) {
                        this.form.longitude = event.latLng.getLat();
                        this.form.latitude = event.latLng.getLng();
                        this.visible = true;
                    });
                });
                this.geocoder.setError(function () {
                    alert("最低搜索为市级");
                });
            });
        },
        openMap() {
            this.visible = true;
            this.TencentMap();
        },
        //根据城市区级搜索
        codeAddress() {
            this.geocoder.getLocation(this.form.address);
            this.mapShow = true;
        },
    }
}
</script>

<style lang="scss" scoped>

.basic>div{
    width: 380px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.map_body {
    width: 80%;
    height: 300px;
    margin-top: 15px;
}
canvas {
    width: 100px;
    height: 100px;
    background-color:#f7f7f7;
    position: fixed;
    left: -200px;
    top: -200px;
}
#location_img {
    position: fixed;
    left: -200px;
    top: -200px;
}
.select_mode {
    width: 120px;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #B6B6B6;
    position: relative;
    box-sizing: border-box;
}
.select_mode:hover{
    border: 1px solid #00A2E9;
}

.select_mode img {
    /*width: 50%;*/
    position: absolute;
    z-index: 1;
    cursor: pointer;
}
</style>