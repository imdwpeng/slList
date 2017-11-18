const ftpClient = require('ftp-client');
const deployConfig = require('./deploy-conf.json');
const glob = require('glob');
const fs = require('fs');

const options = {
    logging: 'basic' //'none' 不显示log, 'basic' 显示基础, 'debug' 显示debug
};


// 上传 node node-ftp prod

var processArg = process.argv.splice(2),
    arguments = processArg[0],
    version = deployConfig.version, // 版本号
    filePath = processArg[1] || "**",
    clientResource,
    clientViews;


console.log('process.argv = ', processArg, version, arguments);

if (arguments == undefined) {
    console.log('`prod`为上传到正式环境,请谨慎使用');
}

if (arguments == 'prod') {
    clientResource = new ftpClient(deployConfig.main.ftpResource, options);
    clientResource.connect(function () {

        clientResource.upload(['../output/resource/' + filePath + '/**'], deployConfig.main.resourcePath, {
            // 把 resource 里的文件上传到 resource
            baseDir: '../output/resource',
            // 'none', 'older', 'all'
            overwrite: 'older'
        }, function (result) {

            if (result.errors) {
                console.log('JS CSS 上传出错 = ', result.errors);
            }

            // 上传resource 结束后,上传view
            clientViews = new ftpClient(deployConfig.main.ftpViews, options);
            clientViews.connect(function () {

                clientViews.upload(['../output/view/' + filePath + '/**'], deployConfig.main.viewsPath, {
                    // 把 views 里的文件上传到 viewsPath
                    baseDir: '../output/view',
                    // 'none', 'older', 'all'
                    overwrite: 'all'
                }, function (result) {
                    if (result.errors) {
                        console.log('html 上传出错 = ', result.errors);
                    }
                });

            });

        });

    });
}





