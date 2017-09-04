//md5连接符
fis.set('project.md5Connector', '.');
fis.set('date', +new Date);

fis.match('*.{js,css}', {
    //加 MD5
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

fis.media('prod')
    .match('*', {
        deploy: fis.plugin('local-deliver', {
            to: './output'
        })
    })
    .match('*.{mst, js, css}', {
        domain: '',
        url: '/test'+'$0'
    })
    .match('**.js', {
        optimizer: fis.plugin('uglify-js')
    })
    .match('**.css', {
        optimizer: fis.plugin('clean-css')
    });