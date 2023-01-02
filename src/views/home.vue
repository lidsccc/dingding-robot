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
						v-if="item.msg"
						class="message-content-msg"
						@click="openUrl(item)"
					>
						{{ item.msg }}
					</div>
					<div v-else><van-loading color="#ffffff" /></div>
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
				{{ isMouseDown ? "正在聆听~" : "小港在~请摁住话筒后开始说话" }}
			</p>
			<div class="buttomIcon">
				<div class="keyboard" @click="callKeyboard"></div>
				<div
					class="voiceButton"
					@touchstart="start"
					@touchend="stop"
				></div>
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
import CryptoJS from "crypto-js";
import { gettoken, getJsapiTicket, getContent } from "@/api/index.js";
import { useMainStore } from "@/store/modules/main.js";
import robotHeader from "@/components/robotHeader.vue";
import { showToast } from "vant";

const mainStore = useMainStore();

const gettokenHandle = async () => {
	const res = await gettoken({
		appkey: "ding04ky0fezpab84xu5",//h5微应用的appKey(可修改)
		appsecret:
			"XdgVFWJaK3W2ujt3_dn6fGaN2UIJp1DqhXUlUv19o95fD4Zt7RwyAVU00Ouqxch-", //h5微应用的appsecret(可修改)
	});
	if (res.data && res.data.errcode === 0) {
		const { data } = res;
		const result = await getJsapiTicket({
			access_token: data.access_token,
		});
		if (result.data && result.data.errcode === 0) {
			const timeStamp = new Date().getTime();
			const url = location.href.split("#")[0];
			const plainTex =
				"jsapi_ticket=" +
				result.data.ticket +
				"&noncestr=" +
				"test" +
				"&timestamp=" +
				timeStamp +
				"&url=" +
				url;
			let signature = CryptoJS.SHA1(plainTex).toString();
			dd.config({
				agentId: "2168990176", // h5微应用的agentId(可修改)
				corpId: mainStore.corpId, // 必填，企业ID
				timeStamp: timeStamp, // 必填，生成签名的时间戳
				nonceStr: "test", // 必填，生成签名的随机串
				signature: signature, // 必填，签名
				type: 0,
				jsApiList: [
					"device.audio.startRecord",
					"device.audio.stopRecord",
					"device.audio.translateVoice",
				], // 必填，需要使用的jsapi列表，注意：不要带dd。
			});
			dd.error(function (err) {
				showToast({
					message: "获取签名失败",
					position: "top",
				});
			});
		} else {
			showToast({
				message: "获取tiket失败",
				position: "top",
			});
			//获取tiket失败
		}
	} else {
		showToast({
			message: "获取access_token失败",
			position: "top",
		});
		//获取access_token失败
	}
};
gettokenHandle();

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
	if (mainStore.platform === 0) {
		showToast({
			message: "PC端暂不支持语音转写",
			position: "top",
		});
	}
};
const keywords = ref("");
const onSearch = async () => {
	if (keywords.value.trim() == "") {
		return (keywords.value = "");
	}
	mainStore.pushMessage({ type: 1, msg: keywords.value });
	try {
		const res = await getContent({ index: keywords.value });
		if (res.status == 200 && res.data?.code == 0) {
			mainStore.pushMessage({ type: 2, msg: res.data.data });
		}
	} catch (error) {}
	keywords.value = "";
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
const start = () => {
	isMouseDown.value = true;
	//开始调用钉钉API
	dd.ready(function () {
		dd.device.audio.startRecord({
			maxDuration: 60,
			onSuccess: function (res) {
				// 调用成功时回调
				// console.log("调用成功", JSON.stringify(res));
			},
			onFail: function (err) {
				// 调用失败时回调
				showToast({
					message: "调用开始录音API失败",
					position: "top",
				});
			},
		});
	});
};
const stop = () => {
	isMouseDown.value = false;
	actionShow.value = false;
	dd.ready(function () {
		mainStore.pushMessage({ type: 1, msg: "" });
		dd.device.audio.stopRecord({
			onSuccess: function (res) {
				// 调用成功时回调
				dd.device.audio.translateVoice({
					mediaId: res.mediaId,
					duration: res.duration,
					onSuccess: async function (result) {
						// 调用成功时回调
						const content = result.content;
						if (content.includes("无内容")) {
							mainStore.popMessage();
							return showToast({
								message: "未识别到内容",
								position: "top",
							});
						}
						const worlds = content.slice(0, content.length - 1);
						mainStore.popMessage();
						mainStore.pushMessage({ type: 1, msg: worlds });
						try {
							const res = await getContent({
								index: worlds,
							});
							if (res.status == 200 && res.data?.code == 0) {
								mainStore.pushMessage({
									type: 2,
									msg: res.data.data,
								});
							}
						} catch (error) {}
					},
					onFail: function (err) {
						mainStore.popMessage();
						showToast({
							message: "调用语音转文字API失败",
							position: "top",
						});
					},
				});
			},
			onFail: function (err) {
				mainStore.popMessage();
				showToast({
					message: "调用停止录音API失败",
					position: "top",
				});
			},
		});
	});
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
	border-radius: 20px;
	background: #1296db url(../assets/img/voicepress.png) no-repeat center
		center;
	background-size: 30px;
	margin-left: 50px;
}
</style>
