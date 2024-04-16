import Vue from 'vue'
import stomp from 'stompjs'
import SockJS from "sockjs-client";
import envConfig from '@/config/envConfig'

var single = (function() {
	var socket, timer, stompClient, subscribeData

	// ( ip:端口号  或  域名 ) / 项目名 /ws/webSocketServer'); //连接服务端提供的通信接口，连接以后才可以订阅广播消息和个人消息
	var url = envConfig.wsUrl

	var unique = {
		isConnection: false, // 判断是否连接成功

		connection() {
			if (!this.isConnection) {
				// 建立连接对象
				socket = new SockJS(url)
				// 获取STOMP子协议的客户端对象
				stompClient = Stomp.over(socket);

				var headers = {
					// 定义连接头信息, 按需求配置

				};

				// 向服务器发起websocket连接
				stompClient.connect(headers, () => {
					this.isConnection = true
					// 监听消息
					subscribeData.forEach(item => {
						stompClient.subscribe(item.destination, (msg) => {
							item.result(msg)
						})
					})
				}, e => {
					// 监听断线
					console.log(e)
					this.isConnection = false
					setTimeout(() => {
						this.connection()
					}, 2000)
				});
			}
		},

		// 订阅消息
		subscribe(...data) {
			subscribeData = data
			this.connection()
		},

		// 发送消息
		send(msgName, content) {
			if (!socket) {
				// 建立连接对象
				//	this.socket = new SockJS(' ( ip:端口号  或  域名 ) / 项目名 /ws/webSocketServer'); //连接服务端提供的通信接口，连接以后才可以订阅广播消息和个人消息
				socket = new SockJS(url);
				// 获取STOMP子协议的客户端对象
				stompClient = Stomp.over(socket);
				stompClient.send(msgName, {}, content);
			} else {
				stompClient.send(msgName, {}, content);
			}
		},

		// 断开连接
		disconnect() {
			if (stompClient != null) {
				this.isConnection = false
				stompClient.disconnect();
			}
		},

	}

	return unique;

})();

export default single;
