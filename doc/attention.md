# 注意事项

## 关于dist目录
由于src下是使用es6编写的代码，而部分node环境无法运行，因此通过babel把src的代码编译到dist目录下。
.npmignore中已经设置了src目录不会随着npm一起发布，发布npm后dist目录下的才是真正运行的代码。
所以如果需要发布新的npm版本，需要手动执行

```shell
npm run babel
```

## 关于bin目录
bin目录下默认引入的都是./dist目录下的代码，目前都是通过手改代码的方式改成引入./src的。不过只要切记发布npm包的时候要依赖./dist的。