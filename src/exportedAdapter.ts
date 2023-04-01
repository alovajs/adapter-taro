import { AdapterTaroOptions } from '../typings';
import requestAdapter from './requestAdapter';
import storageAdapter from './storageAdapter';

/**
 * 统一的taro参数配置
 * @param statesHook 状态hook
 * @param param1 options参数集合
 * @returns alova参数
 */
export default function <SH>(statesHook: SH, { mockRequest }: AdapterTaroOptions) {
	return {
		statesHook,
		requestAdapter: mockRequest || requestAdapter,
		storageAdapter
	};
}
