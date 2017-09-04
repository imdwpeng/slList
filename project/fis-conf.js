/**
 * 系统配置
 */

// 参数处理
var processArg = process.argv.splice(3),
    arguments = processArg[0];

console.log(arguments, 'arguments');

if (arguments == 'prod') {
    //md5连接符
    fis.set('project.md5Connector', '.');
    fis.set('date', +new Date);

    fis.match('(**).{mst, js, css}', {
        // md5加密,没有更改内容则不会变
        useHash: true
    }).match('*.css', {
        //isMod: true,
        postprocessor: fis.plugin("autoprefixer", {
            // 自动CSS3处理
            "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
            "flexboxfixer": true,
            "gradientfixer": true
        })
    });


    // 缓存清理
    fis.on('release:end', function () {
        // 每次处理完都需要重置cache
        fis.cache.clean('compile');
    });

    // fis3 release prod
    //打包
    fis.media('prod')
        .match('*', {
            deploy: fis.plugin('local-deliver', {
                to: '../'
            })
        })
        .match('*.{js, css}', {
            url: '$0'
        })
        .match('*.js', {
            // 压缩JS
            optimizer: fis.plugin('uglify-js')
        })
        .match('*.css', {
            // 压缩CSS
            optimizer: fis.plugin('clean-css')
        });
} else {
    console.log('请带入参数 `打包类型`');
    console.log('`debug`为测试环境');
    console.log('`prod`为正式环境');
}

