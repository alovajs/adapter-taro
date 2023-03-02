// import { UniNamespace } from '@dcloudio/types/uni-app/uni/legacy/uni';
import ReactHook from 'alova/react';
import requestAdapter from './requestAdapter';
import storageAdapter from './storageAdapter';

export default function AdapterTaro() {
	return {
		statesHook: ReactHook,
		requestAdapter: requestAdapter,
		storageAdapter
	};
}
