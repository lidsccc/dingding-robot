import http from "@/utils/axios";
import { paramsAppend } from "@/utils/urlUtils";
//点击发送获取结果
export function getContent(params) {
	return http.request({
		url: `/api/?${paramsAppend(params)}`,
		method: "get",
	});
}
