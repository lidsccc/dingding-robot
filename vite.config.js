import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import { resolve } from "path";
import postcsspxtoviewport from "postcss-px-to-viewport";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	css: {
		postcss: {
			plugins: [
				postcsspxtoviewport({
					unitToConvert: "px", // 要转化的单位
					viewportWidth: 375, // UI设计稿的宽度
					unitPrecision: 6, // 转换后的精度，即小数点位数
					propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
					viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
					fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
					selectorBlackList: ["ignore-"], // 指定不转换为视窗单位的类名，
					minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
					mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
					replace: true, // 是否转换后直接更换属性值
					// exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配，最好不要排除node_modules 文件，排除后在项目中会发现字体不能跟随页面放大
					exclude: [],
					landscape: false, // 是否处理横屏情况
				}),
			],
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"), // 设置 `@` 指向 `src` 目录
		},
	},
	base: "./", // 设置打包路径
	server: {
		host: "10.1.195.184",
		port: 4000, // 设置服务启动端口号
		open: true, // 设置服务启动时是否自动打开浏览器
		cors: true, // 允许跨域
		// 设置代理，根据我们项目实际情况配置
		proxy: {
			"/dingding": {
				target: "https://oapi.dingtalk.com/",
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace("/dingding/", "/"),
			},
			"/api": {
				target: "http://172.31.131.16:6000/",//请求结果接口(可修改)
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace("/api/", "/"),
			},
		},
	},
});
