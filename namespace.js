/**
 * name space of wizard
 *  
 */
var wizard = {
	
	/**
	 * adapters模块集合，封装底层插件，并返回通用的api，适配api，与上层解耦，保证上层调用的api不变
	 */
	adapters : {},
	
	/**
	 * handlers模块集合，组合调用adapters，实现基本完整的功能或步骤的部分逻辑
	 */
	handlers : {},
	
	/**
	 * steps模块集合，调用handlers，为步骤实例集合
	 */
	steps : {}
	
};