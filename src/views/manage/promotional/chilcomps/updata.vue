<template>
    <div>
        <el-dialog title="推广素材管理" :visible.sync="show" width="50%" height="80%" @close="close">
            <el-row :gutter="0">
                <el-col :span="12" :offset="0">
                    <span style="font-size: 14px"> 请上传推广海报 </span>
                    <el-tooltip class="item" effect="dark" content="请上传16:9的尺寸, 建议1920 * 1080" placement="top">
                        <i class="el-icon-question" style="font-size: 20px; color: #288345"></i>
                    </el-tooltip>
                    <upload width="216px" height="396px" ref="imgage_cover" :limit_size="1"></upload>
                </el-col>
                <el-col :span="12" :offset="0">
                    <span style="font-size: 14px"> 请输入文案 </span>
                    <el-input class="inputs" v-model="params.inviteContent" placeholder="请输入文案" type="textarea" size="normal" clearable></el-input>
                </el-col>
            </el-row>
            <span slot="footer">
                <el-button @click="show = false">取消</el-button>
                <el-button type="primary" @click="setInvite">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import Upload from '@/components/upload/Upload.vue';
export default {
    props: {},
    components: { Upload },
    data() {
        return {
            imgs: '',
            form: {
                img: '',
                text: ''
            },
            show: false,
            list: [],
            params: {
                inviteImage: '',
                inviteContent: '',
                id: ''
            }
        };
    },
    methods: {
        // 图片选择后
        onChooseImg(index) {
            // 判断是不是规格内的图片,是的话要记录type跟index
            if (index == 0 || index) {
                this.imgIndex = index;
            } else {
                this.imgIndex = '';
            }
        },
        // 选择图片后
        cutDown(e) {
            this.params.inviteImage = e.dataURL;
        },
        name() {},
        // 关闭弹窗后
        close() {
            this.show = false;
            this.$refs.imgage_cover.path_list = [];
            this.params = {};
        },
        // 请求列表数据
        setInvite() {
            if (this.$refs.imgage_cover.path_list.length < 1) {
                this.$message.warning('请上传照片!');
                return;
            }
            if (!this.params.inviteContent) {
                this.$message.warning('请输入文案!');
                return;
            }
            this.params.inviteImage = this.$refs.imgage_cover.path_list[0].path;
            this.$request.post({
                url: '/mt/pro/setInvite',
                params: this.params,
                success: (res) => {
                    this.list = res;
                    this.$message.success('更新成功!');
                    this.show = false;
                    this.$emit("updata")
                }
            });
        }
    },
    watch: {
        show(newValue, oldValue) {
            if (this.show) {
                setTimeout(() => {
                    this.$refs.imgage_cover.path_list.push({
                        fileName: 'image11.jpg',
                        path: this.imgs
                    });
                }, 100);
            }
        }
    },
    mounted() {}
};
</script>

<style scoped>
.inputs {
    margin-top: 10px;
    min-height: 400px;
}
</style>

