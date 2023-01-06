<template>
	<RouterView />
</template>
<script setup>
import { onMounted } from "vue";
import * as dd from "dingtalk-jsapi";

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
});
</script>
<style scoped></style>
