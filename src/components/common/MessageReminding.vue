<template>
    <div>
        <el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" width="60%" @close="onClose" title="消息提醒">
            <el-table :data="list"  stripe >
                <el-table-column prop="title" label="标题" width="200px" align="center"> </el-table-column>
                <el-table-column prop="message" label="内容" align="center"> </el-table-column>
                <el-table-column prop="createTime" width="200px" label="时间" align="center"> </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>
<script>
export default {
    inheritAttrs: false,
    components: {},
    props: [],
    data() {
        return {
            formData: {},
            rules: {},
            list: [{ title: '售后', message: '拼团订单ID 50 申请仅退款', createTime: 1636797265000 }]
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {
        onOpen() {},
        onClose() {
            // this.$refs['elForm'].resetFields();
        },
        close() {
            this.$emit('update:visible', false);
        },
        handelConfirm() {
            this.$refs['elForm'].validate((valid) => {
                if (!valid) return;
                this.close();
            });
        }
    }
};
</script>
<style>
</style>
