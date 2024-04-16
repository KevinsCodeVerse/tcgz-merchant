<!--
	时间：2018-09-14
	描述：图片上传,  基于 element-ui 组件
-->
<template>
	<div>
		<div class="upload">
			<div class="img_mode" v-for="(item, index) in path_list" :key="index" :style="'height:' + height +';width:'+ width" @mouseenter.stop="over(index)" @mouseleave="out">
				<img ref="imgPath" :src="item.path | fullPath" />
				<transition name="el-fade-in-linear">
					<div v-show="curIndex == index" class="transition-box">
						<div class="mask">
							<i class="el-icon-delete" @click="remove(index)"></i>
							<i class="el-icon-zoom-in" @click="enlarge(index)" v-if="bigBox"></i>
						</div>
					</div>
				</transition>
			</div>
			<div class="select_mode" :style="'height:' + height +';width:'+ width" v-if="isLimit" v-loading="load">
				<input type="file" @change="change($event)" ref="file"  :multiple="isMultiple" />
				<img :src="selectImgPath || selectImg" :width="selectImgWidth || '50%'"/>
			</div>
		</div>
		<el-dialog :visible.sync="isShow" center>
			<div class="big_img_mode">
				<img :src="bigImg" />
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import selectImg from './img/selectedImg.png'

	export default {
		props: {
			// 组件预览图片大小
			height: {
				type: String,
				default: '120px'
			},
			width:{
				type: String,
				default: '120px'
			},			
			selectImgPath: String,  // 未选择图片时显示的图片
			selectImgWidth: String,
			bigBox: {// 是否显示图片放大按钮
				type: Boolean,
				default: true
			},		
			/* 多图上传 */
			isMultiple: {// 是否可多选图片
				type: Boolean,
				default: true
			},	
			limit_size: Number,		// 限制上传数量
			quality: {// 图片压缩率
				type: Number,
				default: 0.7
			},		
			limit: Number,			// 图片超过 (limit * 1024)kb 将进行压缩
			isCompress: {// 是否开启图片压缩
				type: Boolean,
				default: true
			},	
			/* 单图上传 */
			isChangeUpload: false,	// 是否选择文件后触发上传
			action: '', 			// 单图上传路径,
			param: '',			// 上传的参数名
			data: Object,			// 单图上传附带的参数
			success: Function		// 单图上传成功后的回调函数
		},

		data() {
			return {
				selectImg,
				path_list: [],
				curIndex: -1,
				bigImg: '',
				isShow: false,
				isLimit: true,
				load: false
			}
		},
		
		watch:{
			path_list(){
				if(this.path_list.length >= this.limit_size){
					this.isLimit = false
				}else{
					this.isLimit = true
				}
				this.load = false
				this.curIndex = -1
			}
		},
		
		mounted() {
			
		},

		methods: {
			// 鼠标移入
			over(index) {
				this.curIndex = index
			},

			// 鼠标移出
			out() {
				this.curIndex = -1
			},

			// 选择图片
			change() { 
				this.load = true
				var That = this;
				let fileList = this.$refs.file.files
				if(!fileList.length){
					this.load = false 
					return;
				}
				for (var i = 0; i < fileList.length; i++) {
					var file_temp = fileList[i]
					let reader = new FileReader(); //html5读文件
					reader.fileName = file_temp.name
					reader.readAsDataURL(file_temp);
					reader.onload = (data) => { //读取完毕后调用接口
						// 图片压缩
						this.canvasDataURL(data.currentTarget.result, {fileSize: data.total, quality: this.quality }, baseCode=>{
							if(this.isChangeUpload){
								this.changeUpload(baseCode, reader.fileName);
							}else{
								this.path_list.push({
									path: baseCode,
									fileName: reader.fileName
								})
							}
						})
					};
				}
			},

			// 移除图片
			remove(index) {
				this.path_list.splice(index, 1)
			},

			// 放大图片
			enlarge(index) {
				this.isShow = true
				this.bigImg = this.$fullPath(this.path_list[index].path)
			},
			
			// 单图上传
			changeUpload(baseCode, fileName){
				let formData = new FormData();
				formData.append(this.param, baseCode);
				formData.append('fileName', fileName);
				for (var item in this.data) {
					formData.append(item, this.data[item])
				}
				this.$axios.post(this.action, formData).then(response=>{
					if(response.data.message == "succ"){
						this.success()	// 上传成功后的回调函数
					}
					this.load = false
				}).catch(e=>{
					console.log(e)
					this.load = false
				})
			},
			
			/**
			 * @uploadPath 上传的路径
			 * @path_list  base64 集合, 为空则调用 this.path_list
			 * @callback 上传成功后的回调函数, 返回上传成功后的路径
			 */
			upload( uploadPath, path_list, callback ){
				var formData = new FormData()
				if(!path_list){
					this.path_list.forEach( item=>{
						formData.append("files", this.convertBase64UrlToBlob(item.path), item.fileName)					
					})	
				}else{
					path_list.forEach( item=>{
						formData.append("files", this.convertBase64UrlToBlob(item.path), item.fileName)					
					})	
				}
				let headers = {headers: {"Content-Type": "multipart/form-data"}}
				this.$axios.post(uploadPath, formData, headers).then( response=>{
					if(response.data.message == "succ"){
						// 回调函数返回上传成功后的路径
						callback("succ", response.data.result )	
					}else{
						this.$message.error("文件上传失败")
						callback("error" )	
					}
				}).catch(error=>{
					if(error == 'timeout'){
						this.$message.error("文件上传超时")
					}
					this.$message.error("文件上传异常")
					console.log(error)
					callback("error")	
				})
			},
			getName(){
				return this.path_list.fileName
			},
			// 获取base64 集合
			getPaths(){
				let paths = ""
				for(var i = 0; i < this.path_list.length; i++){
					if(i == 0){
						paths = this.path_list[i].path
					}else{
						paths += ","+this.path_list[i].path
					}
				}
				return paths;
			},
			
			photoCompress(){
				
			},
			
			// 图片压缩
			canvasDataURL(path, obj, callback){
	            var img = new Image();
	            img.src = path;
	            img.onload = function(){
	                var that = this;
	                // 默认按比例压缩
	                var w = that.width,
	                    h = that.height,
	                    scale = w / h;
	                w = obj.width || w;
	                h = obj.height || (w / scale);
	                var quality = 0.7;  // 默认图片质量为0.7
	                this.limit = this.limit? this.limit : 1		// 默认为超过1M 进行压缩
	                //生成canvas
	                var canvas = document.createElement('canvas');
	                var ctx = canvas.getContext('2d');
	                // 创建属性节点
	                var anw = document.createAttribute("width");
	                anw.nodeValue = w;
	                var anh = document.createAttribute("height");
	                anh.nodeValue = h;
	                canvas.setAttributeNode(anw);
	                canvas.setAttributeNode(anh);
	                ctx.drawImage(that, 0, 0, w, h);
	                // 图像质量
	                
	                if(obj.quality && obj.quality <= 1 && obj.quality > 0) quality = obj.quality;
	                
	                var base64 = "";
	                if(this.isCompress){
	                	// quality值越小，所绘制出的图像越模糊
	                	base64 = obj.fileSize > (this.limit * 1024)? canvas.toDataURL('image/jpeg', quality) : canvas.toDataURL('image/jpeg');
	                }else{
	                	base64 = canvas.toDataURL('image/jpeg', quality);
	                }
	                // 回调函数返回base64的值
	                callback(base64);
	            }
	        },
			
			// base64 转 blob 对象
			convertBase64UrlToBlob(urlData){  
				//去掉url的头，并转换为byte 
	    	    var bytes=window.atob(urlData.split(',')[1]);        
	    	    //处理异常,将ascii码小于0的转换为大于0  
	    	    var ab = new ArrayBuffer(bytes.length);  
	    	    var ia = new Uint8Array(ab);  
	    	    for (var i = 0; i < bytes.length; i++) {  
	    	        ia[i] = bytes.charCodeAt(i);  
	    	    }  
	    	    return new Blob( [ab] , {type : 'image/png'});  
	    	},
		}
	}
</script>

<style scoped="upload">
	.upload {
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		padding: 10px 4px;
		box-sizing: border-box;
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
	
	.select_mode input[type='file'] {
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		z-index: 2;
	}
	
	.img_mode {
		margin-right: 10px;
		margin-bottom: 10px;
		box-shadow: 0px 1px 5px #CCCCCC;
		position: relative;
	}
	
	.mask {
		background: rgb(0, 0, 0, .5);
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.img_mode img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.mask i {
		font-family: element-icons!important;
		color: #FFFFFF;
		font-size: 25px;
		margin: 0px 8px;
		cursor: pointer;
	}
	.big_img_mode{
		text-align: center;
		width: 100%;
		height: 100%;
		
		max-height: 400px;
	}
	.big_img_mode img{
		max-width: 400px;
    	max-height: 400px;
	}
</style>