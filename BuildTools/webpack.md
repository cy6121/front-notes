
### 基础概念
- Entry: 入口，webpack构建第一步从入口文件开始
- Module: 模块，在webpack里一切皆模块，一个模块对应一个文件
- Chunk: 代码块，一个Chunk由多个模块组合而成，用于代码合成与分割
- Loader: 模块转换器，本质就是一个函数，将模块原内容转换为新内容
- Plugin: 插件，基于事件流框架，在webpack构建过程的生命周期会广播出许多事件，插件可以监听事件并且注入逻辑来改变构建结果
- Output: 输出结果

### 构建流程

- 初始化
    - 初始化参数: 从配置文件、shell参数，与默认配置合并，得到最终参数
    - 创建编译器对象: 根据参数创建编译对象（Compiler）
    - 初始化编译环境: 加载插件，遍历插件执行apply方法
    - 开始编译: compiler.run
    - 初始化entry: 根据入口文件，调用compilation.addEntry，将入口文件转换为Dependency对象
- 构建
    - 编译模块: 根据entry对应的dependence创建module对象，调用loader将模块转换为标准js内容，再进行AST转换，找出依赖的模块，生成依赖关系，再将ast转换code；根据dependencies再递归继续该过程，直到所有依赖都处理完成，得到每个模块被转译后的内容和它们之间依赖关系图
- 生成
    - 根据入口和模块间的依赖关系，组装Chunk；使用动态语句引入的模块，各自组合生成chunk，再把每个chunk转换为单独的文件加入到输出列表
    - 根据配置确定输出的文件名和路径，把文件内容写入文件系统

### hash

- hash: 每次webpack构建时生成一个唯一的hash值
- chunkhash: 单独为chunk创建一个hash，如果关系依赖图上有文件内容发生变更，chunkhash会重新生成
- contenthash: 文件内容变更产生新的hash(使用chunkhash打包js有一个问题，js引入css文件编译后hash值相同，js发生变更但引入的css并没有发生，此时css的hash也会重新生成；可以使用mini-css-extract-plugin里的contenthash值解决这个问题)