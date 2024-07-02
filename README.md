# 允斯无线透传器的内嵌网页版上位机

此项目使用`NPM`包管理, 需要先安装`node`工具。

# 环境准备步骤

##### 本地测试：

1. `npm install`
2. `npm run dev`，或用 `npm run devh` 则可以用其他设备访问，如手机调试移动界面。
3. 根据显示的地址，使用浏览器打开，默认地址为`localhost:5173`， 或者其他设备访问`192.168.X.X:5173`

##### 发布至esp32：

1. `npm install`
2. `npm run build` -> 会在`dist/`生成`index.html`和`ws.sharedworker.js`
3. 在`dist/`里执行`gzip *` -> -> 会在`dist/`生成`index.html.gz`和`ws.sharedworker.js.gz`
4. 至此，可以使用这两个文件覆盖ESP32目录中的`project_components/html`里相对应的文件了。
