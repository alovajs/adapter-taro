import Taro from '@tarojs/taro';
import { createAlova, useRequest } from 'alova';
import VueHook from 'alova/vue';
import { noop } from '../src/helper';
import AdapterTaro from '../src/index';
import { onDownloadCall, onRequestCall, onUploadCall, untilCbCalled } from './utils';

describe('request adapter', () => {
	test.only('should call uni.request and pass the right args', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			beforeRequest(method) {
				method.config.headers.a = 'a';
				method.extra = {
					from: 'beforeRequest'
				};
			},
			responsed(data, m) {
				expect(m.extra).toStrictEqual({
					from: 'beforeRequest'
				});
				expect(m.config.headers.a).toBe('a');

				const { statusCode, data: subData } = data as Taro.request.SuccessCallbackResult<any>;
				expect(statusCode).toBe(200);
				if (subData) {
					return subData;
				}
				return null;
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		interface ResponseData {
			url: string;
			method: string;
			data: any;
			header: Record<string, any>;
		}
		const Get = alovaInst.Get<ResponseData>('/unit-test', {
			params: {
				a: '1',
				b: '2'
			},
			enableHttp2: true,
			enableHttpDNS: true
		});

		// 验证请求数据
		const mockFn = jest.fn();
		onRequestCall(options => {
			mockFn();
			expect(options.url).toBe('http://xxx/unit-test?a=1&b=2');
			expect(options.enableHttp2).toBeTruthy();
			expect(options.enableHttpDNS).toBeTruthy();
		});

		const { loading, data, downloading, error, onSuccess } = useRequest(Get);
		expect(loading.value).toBeTruthy();
		expect(data.value).toBeUndefined();
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value).toBeUndefined();

		await untilCbCalled(onSuccess);
		expect(mockFn).toBeCalledTimes(1);
		expect(loading.value).toBeFalsy();
		expect(data.value.url).toBe('http://xxx/unit-test?a=1&b=2');
		expect(data.value.header).toStrictEqual({ a: 'a' });
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value).toBeUndefined();
	});

	test('should call uni.request with post', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			responsed(data) {
				const { statusCode, data: subData } = data as Taro.request.SuccessCallbackResult<any>;
				expect(statusCode).toBe(200);
				if (subData) {
					return subData;
				}
				return null;
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		interface ResponseData {
			url: string;
			method: string;
			data: any;
			header: Record<string, any>;
		}
		const Post = alovaInst.Post<ResponseData>(
			'/unit-test',
			{ post1: 'p1', post2: 'p2' },
			{
				params: {
					a: '1',
					b: '2'
				},
				dataType: 'json',
				shareRequest: false
			}
		);

		// 验证请求数据
		const mockFn = jest.fn();
		onRequestCall(options => {
			mockFn();
			expect(options.url).toBe('http://xxx/unit-test?a=1&b=2');
			expect(options.data).toStrictEqual({
				post1: 'p1',
				post2: 'p2'
			});
			expect(options.dataType).toBe('json');
		});

		const { loading, data, onSuccess } = useRequest(Post);
		await untilCbCalled(onSuccess);
		expect(mockFn).toBeCalledTimes(1);
		expect(loading.value).toBeFalsy();
		expect(data.value.url).toBe('http://xxx/unit-test?a=1&b=2');
		expect(data.value.header).toStrictEqual({});
		expect(data.value.data).toStrictEqual({
			post1: 'p1',
			post2: 'p2'
		});
	});

	test('request fail with uni.request', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			responsed: {
				onSuccess(data) {
					const { data: subData } = data as Taro.request.SuccessCallbackResult<any>;
					if (subData) {
						return subData;
					}
					return null;
				},
				onError(error) {
					expect(error.message).toBe('mock fail');
					throw error;
				}
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		interface ResponseData {
			url: string;
			method: string;
			data: any;
			header: Record<string, any>;
		}
		const Get = alovaInst.Get<ResponseData>('/unit-test');

		// 模拟请求失败
		onRequestCall(noop, new Error('mock fail'));

		const { loading, data, downloading, error, onError } = useRequest(Get);
		expect(loading.value).toBeTruthy();
		expect(data.value).toBeUndefined();
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value).toBeUndefined();

		const { error: errRaw } = await untilCbCalled(onError);
		expect(loading.value).toBeFalsy();
		expect(data.value).toBeUndefined();
		expect(error.value).toBe(errRaw);
		expect(error.value?.message).toBe('mock fail');
	});

	test('should cancel request when call `task.abort` returned by uni.request', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			responsed(data) {
				const { data: subData } = data as Taro.request.SuccessCallbackResult<any>;
				if (subData) {
					return subData;
				}
				return null;
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		interface ResponseData {
			url: string;
			method: string;
			data: any;
			header: Record<string, any>;
		}
		const Get = alovaInst.Get<ResponseData>('/unit-test');

		const { loading, data, downloading, error, abort, onError } = useRequest(Get);
		expect(loading.value).toBeTruthy();
		expect(data.value).toBeUndefined();
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value).toBeUndefined();

		// 过100毫秒后中断请求
		await untilCbCalled(setTimeout, 100);
		abort();

		await untilCbCalled(onError);
		expect(loading.value).toBeFalsy();
		expect(data.value).toBeUndefined();
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value?.message).toBe('request:fail abort');
	});

	test('should call uni.uploadFile and pass the right args', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			responsed(data) {
				const { statusCode, data: subData } = data as Taro.uploadFile.SuccessCallbackResult;
				expect(statusCode).toBe(200);
				if (subData) {
					return subData;
				}
				return null;
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		const Post = alovaInst.Post<string>(
			'/unit-test',
			{
				name: 'file_name',
				filePath: 'http://file_path',
				f1: 'f1',
				f2: 'f2'
			},
			{
				requestType: 'upload',
				withCredentials: true,
				enableUpload: true
			}
		);

		// 验证请求数据
		const mockFn = jest.fn();
		onUploadCall(options => {
			mockFn();
			expect(options.url).toBe('http://xxx/unit-test');
			expect(options.formData).toStrictEqual({
				f1: 'f1',
				f2: 'f2'
			});
			expect(options.name).toBe('file_name');
			expect(options.filePath).toBe('http://file_path');
			expect(options.withCredentials).toBeTruthy();
		});

		const { loading, data, uploading, downloading, error, onSuccess } = useRequest(Post);
		await untilCbCalled(onSuccess);
		expect(mockFn).toBeCalledTimes(1);
		expect(loading.value).toBeFalsy();
		expect(data.value).toBe('success');
		expect(uploading.value).toEqual({ total: 200, loaded: 200 });
		expect(downloading.value).toEqual({ total: 0, loaded: 0 });
		expect(error.value).toBeUndefined();
	});

	test('should cancel request when call `task.abort` returned by uni.uploadFile', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			responsed(data) {
				const { statusCode, data: subData } = data as Taro.uploadFile.SuccessCallbackResult;
				expect(statusCode).toBe(200);
				if (subData) {
					return subData;
				}
				return null;
			},
			...AdapterTaro(),
			statesHook: VueHook
		});

		const Post = alovaInst.Post<string>(
			'/unit-test',
			{
				name: 'file_name',
				filePath: 'http://file_path',
				f1: 'f1',
				f2: 'f2'
			},
			{
				requestType: 'upload',
				withCredentials: true,
				enableUpload: true
			}
		);

		const { loading, data, uploading, error, onError, abort } = useRequest(Post);
		await untilCbCalled(setTimeout, 150);
		abort();

		await untilCbCalled(onError);
		expect(loading.value).toBeFalsy();
		expect(data.value).toBeUndefined();
		expect(uploading.value).toEqual({ total: 200, loaded: 40 });
		expect(error.value?.message).toBe('uploadFile:fail abort');
	});

	test('should call uni.downloadFile and pass the right args', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			...AdapterTaro(),
			statesHook: VueHook
		});

		const Get = alovaInst.Get<Taro.downloadFile.FileSuccessCallbackResult>('/unit-test', {
			requestType: 'download',
			enableDownload: true,
			filePath: 'http://file_path'
		});

		// 验证请求数据
		const mockFn = jest.fn();
		onDownloadCall(options => {
			mockFn();
			expect(options.url).toBe('http://xxx/unit-test');
			expect(options.filePath).toBe('http://file_path');
		});

		const { loading, data, uploading, downloading, error, onSuccess } = useRequest(Get);
		await untilCbCalled(onSuccess);
		expect(mockFn).toBeCalledTimes(1);
		expect(loading.value).toBeFalsy();
		expect(data.value.statusCode).toBe(200);
		expect(data.value.tempFilePath).toBe('test_path');
		expect(uploading.value).toEqual({ total: 0, loaded: 0 });
		expect(downloading.value).toEqual({ total: 200, loaded: 200 });
		expect(error.value).toBeUndefined();
	});

	test('should cancel request when call `task.abort` returned by uni.downloadFile', async () => {
		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			...AdapterTaro(),
			statesHook: VueHook
		});

		const Get = alovaInst.Get<Taro.downloadFile.FileSuccessCallbackResult>('/unit-test', {
			requestType: 'download',
			enableDownload: true,
			filePath: 'http://file_path'
		});

		const { loading, data, downloading, error, onError, abort } = useRequest(Get);
		await untilCbCalled(setTimeout, 150);
		abort();

		await untilCbCalled(onError);
		expect(loading.value).toBeFalsy();
		expect(data.value).toBeUndefined();
		expect(downloading.value).toEqual({ total: 200, loaded: 40 });
		expect(error.value?.message).toBe('downloadFile:fail abort');
	});
});
