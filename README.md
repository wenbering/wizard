# wizard
	用于步骤流程导航的小框架，提供step间通信，校验，数据存储和处理，多portal切换，国际化以及提供不同粒度的组件库等功能，符合设计原则
    
架构图如下
![image](https://github.com/wenbering/wizard/blob/master/images/wizard.png)

wizard从下到上模块简介
	Plugin		实现页面功能及效果的基本插件单元，可选用，可替换，可自定义
	utils		工具函数库
	Adapter		每个plugin的api适配，上层依赖适配后的插件api，解耦
	Handler		Handler粒度稍大，组合调用adapter实现步骤的逻辑部分，可替换，可自定义，可继承
	Step		Step提供一个完整步骤所需的所有功能，如国际化、初始化及进出step逻辑控制、校验等
			依赖handler的api，可替换，可自定义，可继承
	data center 	模块之间的数据保存、交互
	message center	step间的通信，step模块解耦
	portal		控制场景的切换
	
	Adapter、Handler、Step构成了组件库，提供不同粒度的组件，供调用者选用

优点
	低耦合
		模块与模块之间，层与层之间解耦，上层依赖下层模块的api接口(符合DIP)，
		step之间通过消息通信（step之间可联动）

	高模块化
		模块化程度高，ui及内部逻辑组件化，模块间依赖接口，均可以被独立替换。
		提供不同粒度模块：step、handler、adapter、plug及其他一些组件。UI的plugin也尽量独立分离。
		
	高扩展性(基本符合OCP)
		step、handler、adapter、plugin都可以自定义
		plugin可以随意替换，如果api有变化，需要定义相应的adapter完成接口适配，返回一致的api，
		      plugin与上层解耦，保证上层模块调用的api不变
		handler可以自定义和替换，还可以基于已有handler继承，重写已有方法
		step可以自定义和替换，还可以基于已有step继承，重写已有功能，step定义需符合规范
	
	高复用度
		上层组件可以根据需要组合调用下层组件，wizard初始化时可选用组件库已有或自定义的组件
	
待改进
	该小框架书写时依赖产品的部分底层模块和插件，目前有一小部分未完全剥离独立出来，比如grid和data center对象
	暂未加入view模块
