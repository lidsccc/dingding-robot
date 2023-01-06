<template>
	<div id="container">
		<div class="first">
			<robotHeader />
			<div class="box-shadow robot-message">Hi~您好</div>
			<div class="box-shadow robot-message">您可以直接向我提问</div>
		</div>
		<div v-for="(item, index) in msgList" :key="index">
			<robotHeader v-if="item.type !== 1" />
			<div class="message" :class="item.type === 1 ? 'self' : 'robot'">
				<div class="message-content box-shadow">
					<div
						class="message-content-msg"
						@click="openUrl(item)"
					>
						{{ item.msg }}
					</div>
				</div>
			</div>
		</div>
		<div id="line"></div>
	</div>
	<form action="/" class="form">
		<van-search
			left-icon="none"
			right-icon="../assets/img/voice.png"
			background="ffffff"
			class="search box-shadow"
			v-model="keywords"
			shape="round"
			placeholder="请输入"
			@search="onSearch"
		>
			<template #right-icon>
				<div class="right-icon" @click="callVoice"></div>
			</template>
		</van-search>
	</form>
	<van-action-sheet
		class="actionSheet"
		v-model:show="actionShow"
		:closeable="true"
	>
		<div class="actionSheetContent">
			<div
				class="buttomhead"
				:class="isMouseDown ? 'buttomheadactive' : ''"
			></div>
			<p class="content">
				{{
					isMouseDown
						? "正在聆听~点击下方按钮结束说话"
						: "小港在~请点击下方按钮开始说话"
				}}
			</p>
			<div class="buttomIcon">
				<div class="keyboard" @click="callKeyboard"></div>
				<div v-if="isMouseDown" class="voiceButton" @click="stop">
					结束对讲
				</div>
				<div v-else class="voiceButton" @click="start">开始对讲</div>
			</div>
		</div>
	</van-action-sheet>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
	name: "Home",
});
</script>
<script setup>
import { computed, ref, watch, nextTick } from "vue";
import * as dd from "dingtalk-jsapi";
import { getContent } from "@/api/index.js";
import { useMainStore } from "@/store/modules/main.js";
import robotHeader from "@/components/robotHeader.vue";

const mainStore = useMainStore();
const ws = ref("");
const arrs = ref("");
const useWebSocket = () => {
	ws.value = new WebSocket(
		"wss://10.169.19.34:4590/tuling/ast/v2/ASTXVBVOPT3D5JBFSWA?appId=10101&bizId=ASTXVBVOPT3D5JBFSWA&bizName=WebSockets&lan=chin&sr=16000&bps=16&fs=4096"
	);
	ws.value.binaryType = "blob"; //传输的是 ArrayBuffer 类型的数据
	ws.value.onopen = function () {
		console.log("握手成功");
		if (ws.value.readyState == 1) {
			//ws进入连接状态，则每隔500毫秒发送一包数据
			record.value.start();
		}
	};
	ws.value.onmessage = function (msg) {
		const _data = JSON.parse(msg.data);
		arrs.value = _data.ws;
	};
	ws.value.onerror = function (err) {
		console.info(err, "错误");
	};
};
const msgList = computed(() => {
	return mainStore.messageList;
});
watch(
	() => msgList,
	() => {
		nextTick(() => {
			const box = document.querySelector("#line");
			box.scrollIntoView();
		});
	},
	{
		deep: true,
	}
);
const callVoice = () => {
	actionShow.value = true;
};
const keywords = ref("");
const onSearch = () => {
	if (keywords.value.trim() == "") {
		return (keywords.value = "");
	}
	mainStore.pushMessage({ type: 1, msg: keywords.value });
	getContent({ index: keywords.value })
		.then((res) => {
			if (res?.data?.code == 0) {
				mainStore.pushMessage({
					type: 2,
					msg: res.data.data,
				});
			}
		})
		.catch((err) => {
			console.log(err);
		})
		.finally(() => {
			keywords.value = "";
		});
};
const openUrl = (item) => {
	if (item.type !== 1) {
		dd.biz.util.openLink({
			url: item.msg, //要打开链接的地址
			onSuccess: function (result) {
				/**/
			},
			onFail: function (err) {},
		});
	}
};
const actionShow = ref(false);
const callKeyboard = () => {
	actionShow.value = false;
	const input = document.querySelector("input");
	input.focus();
};
const isMouseDown = ref(false);
const record = ref("");
const init = (rec) => {
	record.value = rec;
};
function Recorder(stream) {
	var sampleBits = 16; //输出采样数位 8, 16
	var sampleRate = 1600; //输出采样率
	var context = new AudioContext();
	var audioInput = context.createMediaStreamSource(stream);
	var recorder = context.createScriptProcessor(4096, 1, 1);
	var audioData = {
		size: 0, //录音文件长度
		buffer: [], //录音缓存
		inputSampleRate: 4800, //输入采样率
		inputSampleBits: 16, //输入采样数位 8, 16
		outputSampleRate: sampleRate, //输出采样数位
		oututSampleBits: sampleBits, //输出采样率
		clear: function () {
			this.buffer = [];
			this.size = 0;
		},
		input: function (data) {
			this.buffer.push(new Float32Array(data));
			this.size += data.length;
		},
		compress: function () {
			//合并压缩
			//合并
			var data = new Float32Array(this.size);
			var offset = 0;
			for (var i = 0; i < this.buffer.length; i++) {
				data.set(this.buffer[i], offset);
				offset += this.buffer[i].length;
			}
			//压缩
			var compression = parseInt(
				this.inputSampleRate / this.outputSampleRate
			);
			var length = data.length / compression;
			var result = new Float32Array(length);
			var index = 0,
				j = 0;
			while (index < length) {
				result[index] = data[j];
				j += compression;
				index++;
			}
			return result;
		},
		encodePCM: function () {
			//这里不对采集到的数据进行其他格式处理，如有需要均交给服务器端处理。
			var sampleRate = Math.min(
				this.inputSampleRate,
				this.outputSampleRate
			);
			var sampleBits = Math.min(
				this.inputSampleBits,
				this.oututSampleBits
			);
			var bytes = this.compress();
			var dataLength = bytes.length * (sampleBits / 8);
			var buffer = new ArrayBuffer(dataLength);
			var data = new DataView(buffer);
			var offset = 0;
			for (var i = 0; i < bytes.length; i++, offset += 2) {
				var s = Math.max(-1, Math.min(1, bytes[i]));
				data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			}
			return new Blob([data]);
		},
	};
	var sendData = function () {
		//对以获取的数据进行处理(分包)
		var reader = new FileReader();
		reader.onload = (e) => {
			var outbuffer = e.target.result;
			var arr = new Int8Array(outbuffer);
			if (arr.length > 0) {
				var tmparr = new Int8Array(1024);
				var j = 0;
				for (var i = 0; i < arr.byteLength; i++) {
					tmparr[j++] = arr[i];
					if ((i + 1) % 1024 == 0) {
						ws.value.send(tmparr);
						if (arr.byteLength - i - 1 >= 1024) {
							tmparr = new Int8Array(1024);
						} else {
							tmparr = new Int8Array(arr.byteLength - i - 1);
						}
						j = 0;
					}
					if (i + 1 == arr.byteLength && (i + 1) % 1024 != 0) {
						ws.value.send(tmparr);
					}
				}
			}
		};
		reader.readAsArrayBuffer(audioData.encodePCM());
		// console.log(audioData);
		audioData.clear(); //每次发送完成则清理掉旧数据
	};
	this.start = function () {
		audioInput.connect(recorder);
		recorder.connect(context.destination);
	};
	this.stop = function () {
		recorder.disconnect();
	};
	this.getBlob = function () {
		return audioData.encodePCM();
	};
	this.clear = function () {
		audioData.clear();
	};
	recorder.onaudioprocess = function (e) {
		var inputBuffer = e.inputBuffer.getChannelData(0);
		audioData.input(inputBuffer);
		sendData();
	};
}
const start = () => {
	isMouseDown.value = true;
	navigator.getUserMedia =
		navigator.getUserMedia || navigator.webkitGetUserMedia;
	if (!navigator.getUserMedia) {
		alert("浏览器不支持音频输入");
	} else {
		navigator.getUserMedia(
			{
				audio: true,
			},
			function (mediaStream) {
				const res = new Recorder(mediaStream);
				init(res);
				console.log("开始对讲");
				useWebSocket();
			},
			function (error) {
				console.log(error);
				switch (error.message || error.name) {
					case "PERMISSION_DENIED":
					case "PermissionDeniedError":
						console.info("用户拒绝提供信息。");
						break;
					case "NOT_SUPPORTED_ERROR":
					case "NotSupportedError":
						console.info("浏览器不支持硬件设备。");
						break;
					case "MANDATORY_UNSATISFIED_ERROR":
					case "MandatoryUnsatisfiedError":
						console.info("无法发现指定的硬件设备。");
						break;
					default:
						console.info(
							"无法打开麦克风。异常信息:" +
								(error.code || error.name)
						);
						break;
				}
			}
		);
	}
};
const word = ref("");
const stop = () => {
	isMouseDown.value = false;
	actionShow.value = false;
	if (ws.value) {
		console.log(arrs.value, "arrs");
		ws.value.close();
		record.value.stop();
		if (arrs.value) {
			arrs.value.forEach((element) => {
				word.value += element.cw[0].w;
			});
			mainStore.pushMessage({ type: 1, msg: word.value });
			getContent({ index: word.value })
				.then((res) => {
					if (res?.data?.code == 0) {
						mainStore.pushMessage({
							type: 2,
							msg: res.data.data,
						});
					}
				})
				.catch((err) => {
					console.log(err);
				})
				.finally(() => {
					word.value = "";
				});
		}
	}
};
</script>
<style scoped>
#container {
	/* height: 100%; */
	padding: 0 10px;
	margin-bottom: 60px;
	overflow: auto;
}
.first {
	display: flex;
	flex-direction: column;
}
.robot-message {
	align-self: baseline;
	padding: 5px 15px;
	margin-bottom: 10px;
	border-radius: 10px 10px 10px 0;
}
.box-shadow {
	box-shadow: 2px 2px 2px 0 rgba(149, 151, 180, 0.3), -2px -2px 5px 0 #fff;
}
.message {
	display: flex;
}
.self {
	flex-direction: row-reverse;
}
.message-content {
	max-width: 100%;
	padding: 5px 15px;
	margin-bottom: 10px;
	border-radius: 10px 10px 10px 0;
}
.message-content-msg {
	max-width: 100%;
	word-wrap: break-word;
	word-break: break-all;
}
.self .message-content {
	color: #ffffff;
	background-color: #006ffd;
	border-radius: 10px 10px 0 10px;
}
.robot .message-content-msg {
	text-decoration: underline;
	color: #006ffd;
}
.form {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
}

.search {
	height: 60px;
}
.right-icon {
	width: 20px;
	height: 20px;
	background: url(../assets/img/voiceclick.png) no-repeat;
	background-size: 20px;
}
.actionSheetContent {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 220px;
	background-color: #fff;
}
.buttomhead {
	width: 90px;
	height: 90px;
	background: url(../assets/img/defaulthead.png) no-repeat;
	background-size: 90px;
}
.buttomheadactive {
	background: url(../assets/img/activehead.png) no-repeat;
	background-size: 90px;
}
.content {
	font-size: 18px;
}
.buttomIcon {
	margin-top: 10px;
	width: 100%;
	display: flex;
	align-items: center;
}
.keyboard {
	width: 60px;
	height: 60px;
	background: url(../assets/img/keyboard.png) no-repeat;
	background-size: 60px;
	margin-left: 20px;
}
.voiceButton {
	width: 120px;
	height: 40px;
	text-align: center;
	font-size: 20px;
	line-height: 40px;
	color: #ffffff;
	border-radius: 20px;
	margin-left: 50px;
	background-color: #006ffd;
}
</style>
