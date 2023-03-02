import Taro from '@tarojs/taro';
import { AlovaGlobalStorage, Method, ProgressUpdater, RequestElements } from 'alova';
import ReactHook from 'alova/react';

/**
 * uni.request请求额外参数
 */
export type TaroRequestConfig = Omit<
	Taro.request.Option,
	'url' | 'data' | 'header' | 'method' | 'timeout' | 'success' | 'fail' | 'complete'
>;

/**
 * uni.uploadFile额外参数
 */
export type TaroUploadConfig = Omit<
	Taro.uploadFile.Option,
	'url' | 'filePath' | 'name' | 'header' | 'formData' | 'timeout' | 'success' | 'fail' | 'complete'
>;

/**
 * uni.downloadFile额外参数
 */
export type TaroDownloadConfig = Omit<
	Taro.downloadFile.Option,
	'url' | 'header' | 'timeout' | 'success' | 'fail' | 'complete'
>;

/**
 * 合并的请求配置参数
 */
export type TaroConfig = {
	/**
	 * 请求类型，upload表示上传，download表示下载，不填写表示正常请求
	 */
	requestType?: 'upload' | 'download';
} & TaroRequestConfig &
	TaroUploadConfig &
	TaroDownloadConfig;

/**
 * 请求适配器返回数据
 */
interface TaroRequestAdapterReturn {
	response: () => Promise<
		| Taro.uploadFile.SuccessCallbackResult
		| Taro.downloadFile.FileSuccessCallbackResult
		| Taro.request.SuccessCallbackResult<any>
	>;
	headers: () => Promise<Taro.request.SuccessCallbackResult<any>['header']>;
	abort: () => void;
	onDownload: (handler: ProgressUpdater) => void;
	onUpload: (handler: ProgressUpdater) => void;
}

/**
 * taro请求适配器
 */
export interface TaroRequestAdapter {
	(
		elements: RequestElements,
		method: Method<
			any,
			any,
			any,
			any,
			TaroConfig,
			| Taro.uploadFile.SuccessCallbackResult
			| Taro.downloadFile.FileSuccessCallbackResult
			| Taro.request.SuccessCallbackResult<any>,
			Taro.request.SuccessCallbackResult<any>['header']
		>
	): TaroRequestAdapterReturn;
}

declare function AdapterTaro(): {
	statesHook: typeof ReactHook;
	requestAdapter: TaroRequestAdapter;
	storageAdapter: AlovaGlobalStorage;
};
export default AdapterTaro;
