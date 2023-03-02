import Taro from '@tarojs/taro';
import { AlovaGlobalStorage } from 'alova';

export default {
	get(key) {
		return Taro.getStorageSync(key);
	},
	set(key, value) {
		Taro.setStorageSync(key, value);
	},
	remove(key) {
		Taro.removeStorageSync(key);
	}
} as AlovaGlobalStorage;
