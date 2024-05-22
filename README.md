# 允斯无线透传器的内嵌网页版上位机

此项目使用`NPM`包管理

# 环境准备步骤

##### 本地测试：

1. `npm install`
2. `npm run dev`
3. 打开 `localhost:5173`

##### 发布至esp32：

1. `npm install`
2. `npm run build` -> 会在`dist/`生成`index.html`和`ws.sharedworker.js`
3. 在`dist/`里执行`gzip *` -> -> 会在`dist/`生成`index.html.gz`和`ws.sharedworker.js.gz`
4. 至此，可以使用这两个文件覆盖ESP32目录中的`project_components/html`里相对应的文件了。
