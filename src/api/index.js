import http from "@/utils/axios";
import { paramsAppend } from "@/utils/urlUtils";
// 获取access_token
export function gettoken(params) {
	return http.request({
		url: `/dingding/gettoken?${paramsAppend(params)}`,
		method: "get",
	});
}
//获取jsapi_ticket
export function getJsapiTicket(params) {
	return http.request({
		url: `/dingding/get_jsapi_ticket?${paramsAppend(params)}`,
		method: "get",
	});
}
//点击发送获取结果
export function getContent(params) {
	return http.request({
		url: `/api/?${paramsAppend(params)}`,
		method: "get",
	});
}
