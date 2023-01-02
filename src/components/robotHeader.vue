<template>
	<div class="header">
		<div class="header-icon"></div>
		<div class="header-content">
			<div class="header-title">AI智能助手</div>
			<div class="header-name">小港</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
	name: "robotHeader",
});
</script>

<style scoped>
.header {
	display: flex;
  margin-bottom: 10px;
}
.header-icon {
	width: 40px;
	height: 40px;
	background: url(../assets/img/defaulthead.png) no-repeat;
	background-size: 40px;
	margin: 10px 10px 0 0;
}
.header-content {
	display: flex;
	flex-direction: column;
}
.header-title {
	color: #62636b;
}
.header-name {
	font-size: 20px;
}
</style>
