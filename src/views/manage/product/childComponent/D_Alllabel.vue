<template>
    <el-dialog title="分配标签" :visible.sync="showVisible" width="30%" @close="onClose">
        <el-select v-model="checLabels" multiple placeholder="请选择标签">
            <el-option v-for="item in labelList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
            <el-button @click="onClose">取 消</el-button>
            <el-button type="primary" @click="checkLabel">确 定</el-button>
        </span>
    </el-dialog>
    <!-- <el-dialog
        title="分配标签"
        :visible.sync="labelVisible"
        :close-on-click-modal="false"
        width="30%"
        :before-close="handleCloseLabel">
           
        </el-dialog> -->
</template>

<script>
export default {
    name: 'Di',
    data() {
        return {
            checLabels: [],
            checkAgId: '',
            labelList: []
        };
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        ids: Number,
        type: Number,
        labelData: String
    },
    methods: {
        // 设置标签
        setTag() {
            this.$request.post({
                url: 'mt/pro/setIdentify',
                params: {
                    id: this.ids,
                    type: this.type,
                    afterSellIdent: this.checLabels.join(',')
                },
                success: (res) => {
                        this.$message.success('操作成功');

                    this.onClose();
                },
                error: () => {},
                finally: () => {}
            });
        },
        //checkLabel
        checkLabel() {
            console.log(this.checLabels);
            this.setTag();
        },
        onClose() {
            this.checLabels = [];
            this.$emit('show_event', false);
            this.$emit('refresh');
        },
        // 获取所有标签
        getAllLabel() {
            // if(this.loading) return;
            this.loading = true;
            this.$request.post({
                url: 'mt/pro/identifyList',
                params: {
                    type: this.type
                },
                success: (result) => {
                    this.labelList = result;
                    let labelArr = [];
                    let arr = [];
                    this.labelData && (arr = this.labelData.split(',') || []);
                    console.log(arr);
                    // console.log(result);
                    let isNull = 0;
                    let NullId = [];
                    arr.forEach((item) => {
                        isNull = 0;
                        result.forEach((item2) => {
                            if (item2.id != item) {
                                isNull++;
                            }
                        });
                        console.log(isNull);
                        if (isNull != result.length) NullId.push(item);
                    });
                    
                    NullId.forEach((element) => {
                        this.checLabels.push(element * 1);
                    });
                },
                finally: () => {
                    this.loading = false;
                }
            });
        }
    },
    watch: {
        show(newValue, oldValue) {
            if (this.show) {
                this.checLabels = [];
                this.getAllLabel();
            }
        }
    },
    computed: {
        showVisible: {
            get: function () {
                return this.show;
            },
            set: function (val) {
                return false;
            }
        }
    },
    model: {
        prop: 'show',
        event: 'show_event'
    }
};
</script>

<style>
</style>
<style lang="sass" scoped>
</style>