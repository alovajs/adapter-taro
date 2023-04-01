import { AlovaGlobalStorage } from 'alova';
import VueHook from 'alova/vue';
import { AdapterTaroOptions, TaroRequestAdapter } from '.';

/**
 * Vue3适配器集合
 * @param options 请求配置参数
 */
declare function AdapterTaroVue(options?: AdapterTaroOptions): {
	statesHook: typeof VueHook;
	requestAdapter: TaroRequestAdapter;
	storageAdapter: AlovaGlobalStorage;
};
export default AdapterTaroVue;
