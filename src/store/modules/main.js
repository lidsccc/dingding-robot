import { defineStore } from "pinia";
export const useMainStore = defineStore({
	id: "main",
	state: () => {
		return {
			messageList: [],
		};
	},
	actions: {
		pushMessage(msg) {
			this.messageList.push(msg);
		},
	},
});
