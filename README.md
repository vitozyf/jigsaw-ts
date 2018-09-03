## jigsaw滑动验证码

1. 全局添加`globals.d.ts`文件

```
增加Window接口定义

declare global {
  interface Window { jigsaw: any; }
}
```

2. 引入`jigsaw.ts`及`jigsaw.scss`

3. 初始化

   ```
   this.Jigsaw = jigsaw.init({

     el: document.getElementById('verificationContainer'),
     
     onSuccess: function () {

     },
     
     onFail: function () {

     },
     
     onRefresh: function () { 

     }
     
   })
   ```

### Tips：

1. 图片从 [https://picsum.photos/](https://picsum.photos/) 随机获取，然后用canvas裁剪生成滑块。
2. 未编译ES6语法，建议使用现代浏览器体验。
3. 纯前端验证对安全性没意义，因此本项目仅供学习交流，不考虑实用性。