import "lib-flexible/flexible";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import store from "./store/index";
import "vant/lib/index.css";
import "./style.css";
import { Search } from "vant";
import { ActionSheet } from "vant";

const app = createApp(App);
app.use(Search);
app.use(ActionSheet);
app.use(router).use(store).mount("#app");
