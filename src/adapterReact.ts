import ReactHook from 'alova/react';
import { AdapterTaroOptions } from '../typings';
import exportedAdapter from './exportedAdapter';
export { default as taroMockResponse } from './mockResponse';
export { default as taroRequestAdapter } from './requestAdapter';
export { default as taroStorageAdapter } from './storageAdapter';

export default function (options: AdapterTaroOptions = {}) {
	return exportedAdapter(ReactHook, options);
}
