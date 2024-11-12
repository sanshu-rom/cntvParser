'use strict';

// 定义去掉右侧斜杠的函数
function removeTrailingSlash(url) {
    return url.replace(/\/+$/, ''); // 去掉一个或多个斜杠
}

const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

const { processFile } = require('./utils/processor');
const BASE_URL = removeTrailingSlash('https://dh5.cntv.myalicdn.com/');

// 定义首页路由
fastify.get('/', async (request, reply) => {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    reply.type('text/html').send(htmlContent);
});

// Process 接口
fastify.get('/process', async (request, reply) => {
    const url = request.query.url;
    if (!url) {
        reply.code(400).send({ error: 'URL parameter is required' });
        return;
    }

    try {
        const filename = path.basename(new URL(url).pathname);
        const extension = path.extname(filename).toLowerCase();
        if (extension !== '.ts' && extension !== '.m3u8') {
            reply.code(400).send({ error: 'Only .ts and .m3u8 files are supported' });
            return;
        }

        const contentType = extension === '.ts' ? 'video/MP2T' : 'application/vnd.apple.mpegurl';
        const buffer = await processFile(url, extension);

        reply
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .header('Content-Type', contentType)
            .send(buffer);
    } catch (error) {
        reply.code(500).send({ error: 'Failed to process data from URL' });
    }
});

// 统一的代理接口
fastify.get('/proxy/*', async (request, reply) => {
    const relativePath = request.params['*'];
    const url = `${BASE_URL}/${relativePath}`;

    try {
        const filename = path.basename(url);
        const extension = path.extname(filename).toLowerCase();

        // 检查扩展名是否有效
        if (extension !== '.ts' && extension !== '.m3u8') {
            reply.code(400).send({ error: 'Only .ts and .m3u8 files are supported' });
            return;
        }

        // 设置内容类型
        const contentType = extension === '.ts' ? 'video/MP2T' : 'application/vnd.apple.mpegurl';

        // 处理文件
        const buffer = await processFile(url, extension);

        // 设置响应头并发送数据
        reply
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .header('Content-Type', contentType)
            .send(buffer);
    } catch (error) {
        reply.code(500).send({ error: `Failed to process file: ${error.message}` });
    }
});

// 启动服务器
fastify.listen({ port: 5710, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
