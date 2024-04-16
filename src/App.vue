<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
		created() {
			this.handleResize();
        	window.addEventListener('resize', this.handleResize)
		},
		mounted() {
		},
		
		methods:{
			handleResize (event) {
				var fullWidth = document.documentElement.clientWidth
				if(fullWidth > 768) {
					this.$store.state.isPhone = false;
					this.$store.state.navOpen = true;
				} else {
					this.$store.state.isPhone = true;
					this.$store.state.navOpen = false;
				}
			},
		}
	}
</script>


<style lang="scss">
	@import url("./assets/css/element-ui.css");
	@import url("./assets/css/public.css");
	
	* {
		padding: 0;
		margin: 0;
	}

	body {
		// background-color: #F5F5F5;
		overflow: hidden;
		padding: 0 !important;
	}
	@media screen and (max-width: 768px) {
		.el-message-box {
			width: 80% !important;
		}
		.el-dialog {
			width: 80% !important;
		}
		.el-dialog .el-form-item__label {
			display: none !important;
		}
		.el-dialog .el-form-item__content {
			margin-left: 0 !important;
		}
	}
	
	// .theme-color:{
	// 	// color: $color-primary;
	// }
  	.page{
		text-align: right;
		margin-top: 20px;
	}
	.el-button--small {
		margin: 5px !important;
	}

	// 新订单提醒
	.notify_html {
		.notify_html_desc {
			color: #999999;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.href {
			color: #00a2e9;
			cursor: pointer;
		}
	}
</style>
