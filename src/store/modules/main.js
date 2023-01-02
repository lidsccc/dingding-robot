import { defineStore } from "pinia";
export const useMainStore = defineStore({
	id: "main",
	state: () => {
		return {
			corpId: "",
			messageList: [],
			platform: 1, //移动端
		};
	},
	actions: {
		checkPlatform(platformType) {
			if (!platformType) {
				this.platform = 0;
			}
		},
		setCorpId(data) {
			this.corpId = data;
		},
		pushMessage(msg) {
			this.messageList.push(msg);
		},
		popMessage() {
			this.messageList.pop();
		},
	},
});
