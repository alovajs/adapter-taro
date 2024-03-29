/*
 * @Date: 2020-04-09 11:06:01
 * @LastEditors: JOU(wx: huzhen555)
 * @LastEditTime: 2022-11-30 21:15:34
 */
var typescript = require('rollup-plugin-typescript2');
var { readFileSync } = require('fs');

const getCompiler = (
	opt = {
		// objectHashIgnoreUnknownHack: true,
		// clean: true,
		tsconfigOverride: {
			compilerOptions: {
				module: 'ES2015'
			}
		}
	}
) => typescript(opt);
exports.getCompiler = getCompiler;

const pkg = require('../package.json');
const version = process.env.VERSION || pkg.version;
const { author, homepage, name } = pkg;
const repository = pkg.repository.url.replace('git', 'https').replace('.git', '');
exports.banner = `/**
  * ${name} ${version} (${homepage})
  * Copyright ${new Date().getFullYear()} ${author}. All Rights Reserved
  * Licensed under MIT (${repository}/blob/master/LICENSE)
  */
`;

const compilePaths = {
	core: {
		external: ['alova', 'alova/react', '@tarojs/taro'],
		packageName: 'AlovaAdapterTaro',
		input: 'src/adapterReact.ts',
		output: suffix => `dist/alova-adapter-taro.${suffix}.js`
	},
	vue: {
		external: ['alova', 'alova/vue', '@tarojs/taro'],
		packageName: 'AlovaAdapterTaroVue',
		input: 'src/adapterVue.ts',
		output: suffix => `dist/alova-adapter-taro-vue.${suffix}.js`
	}
};

const compileModule = process.env.MODULE || 'core';
exports.external = compilePaths[compileModule].external || [];
exports.compilePath = compilePaths[compileModule];
