 
 # mobile-lock

## 手势密码组件

[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
 
使用原生JS和Canvas，编写移动端手势密码解锁组件。

演示地址：http://tangzhirong.github.io/lock/example/demo.html

### 使用说明
1. 加入meta标签
```
   <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
```
2. 引入手势密码组件
```
  <script src="../src/lock.js"></script>
```

3. 引入样式表
```
  <link rel="stylesheet" type="text/css" href="../src/lock.css">
```

4. 获取移动设备尺寸，初始化组件
```
    //获取设备屏幕宽度
    var screenWidth = window.screen.width;
    //构造专属于你的手势密码
    var yourLock = new lock({
        size:screenWidth,  //手势区大小由设备screen宽度决定
        title:"小米5s手势密码",  //设置组件头部标题，可自定义
        panelSize:3  //设置手势区单边圆圈数，默认为3个，可自定义
    });
    yourLock.renderDom();  //创建DOM结构
    yourLock.init();   //初始化组件
    yourLock.bindEvent();  //绑定事件
```


### Tips
* 不同移动端设备屏幕尺寸适配
* 支持部分参数自定义（标题、手势区圆点个数）
