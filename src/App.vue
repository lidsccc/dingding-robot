<template>
	<RouterView />
</template>
<script setup>
import { onMounted, ref } from "vue";
import { parseCorpId } from "@/utils/userChange.js";
import { useMainStore } from "@/store/modules/main.js";
import * as dd from "dingtalk-jsapi";

const mainStore = useMainStore();
const corpId = ref("");
const originalUrl = location.href;
corpId.value = parseCorpId(originalUrl, "corpId");
mainStore.setCorpId(corpId.value);
onMounted(() => {
	try {
		dd.ready(function () {
			try {
				dd.ui.webViewBounce.disable();
			} catch (error) {}
		});
	} catch (e) {
		console.log(e);
	}
	const flag = navigator.userAgent.match(
		/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
	);
	mainStore.checkPlatform(flag);
});
</script>
<style scoped></style>
