# cntvParser - 央视点播解析工具

可以将央视点播的花屏m3u8解析成正常的m3u8，支持自定义分辨率

# 安装依赖

```shell
yarn
```

# 运行

```
yarn dev
```

# 打包

```
yarn build:win
```

# 服务器部署
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
source ~/.bashrc
nvm install 22
npm config set registry https://registry.npmmirror.com
npm install -g cnpm --registry=https://registry.npmmirror.com
npm i -g pm2 yarn@1.22.19
yarn
pm2 start index.js
pm2 ls
pm2 stop 0
pm2 start 0
```
