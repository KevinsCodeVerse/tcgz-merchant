<template>
    <el-container>
        <LeftNav />
        <el-container id="container">
            <Header />
            <Main />
            <!-- <Footer /> -->
        </el-container>
        <Drawer />
    </el-container>
</template>

<script>
import Header from '@/components/models/Header';
import LeftNav from '@/components/models/LeftNav';
import Main from '@/components/models/Main';
import Drawer from '@/components/models/Drawer';
// import Footer from '@/components/models/Footer'
import ws from '@/utils/websocket';

export default {
    components: {
        Header,
        LeftNav,
        Main,
        Drawer
        // Footer
    },

    data() {
        return {
            notify: {}
        };
    },

    watch: {},

    async mounted() {
        this.websubscribe();
        // PubSub.subscribe('showNotify', (msg, data)=>{
        // 	var obj = this.$notify({title: data.title, message: data.message, duration: 0, position: 'bottom-right', showClose: false})
        // 	this.notify[data.uid] = obj;
        // })
        this.getQueryOpen();
    },

    methods: {
        websubscribe() {
            let id = sessionStorage.getItem('id');
            // ws.subscribe({
            //     destination: '/queue/user/' + id + '/sendMessage',
            //      result:(res)=>{
            //          console.log(res);
            //          console.log("---------");
            //      }
            // })
            ws.subscribe({
                destination: '/queue/user/' + id + '/sendMessage',
                result: (msg) => {

                    var result = JSON.parse(msg.body).userOrder;
                    result.proInfo = JSON.parse(result.proInfo);
                    let html = `<div class="notify_html">
											<p class="notify_html_desc">有人购买了"${result.proInfo.title}"</p>
											<a class="href" href="${document.location.protocol + '//' + document.location.host}/merchant/order/list">前往查看</p>
										</div>`;
                    this.$notify({
                        title: '有新订单啦~~',
                        dangerouslyUseHTMLString: true,
                        message: html,
                        duration: 0
                    });
                    setTimeout(() => {
                        this.$bus.$emit('refreshOrder'); // 更新 提醒
                    }, 300);
                    // if(result.result == true){
                    // 	this.$alert('数据回滚成功, 请重新登录', {
                    // 	confirmButtonText: '确定',
                    // 	callback: action => {
                    // 		this.$router.replace('/login')
                    // 	}
                    // 	});
                    // }else{
                    // 	this.$message.error('回滚失败')
                    // }
                    // this.notify[result.uid].close();
                }
            });
        },
        // 获取应用 权限
        getQueryOpen() {
            this.$request.post({
                url: '/mt/app/queryOpen',
                success: (res) => {
                    this.$store.commit('GETQUERYOPEN', res);
                },
                finally: (err) => {}
            });
        }
    },

    beforeDestroy() {
        ws.disconnect();
        // // 取消订阅, 防止造成多次订阅
        PubSub.unsubscribe('showNotify');
    }
};
</script>

<style>
#container {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
}
</style>

<style scoped>
</style>
