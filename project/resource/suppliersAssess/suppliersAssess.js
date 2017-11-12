/**
 * Created by Eric on 17/11/10.
 */

$(document).ready(function () {
    init();

    //模糊搜索供应商
    $('#J_name').on('valuechange keyup', function () {
        fuzzySearch($(this));
    });

    //选择模糊搜索列表
    $('.bd').on('click', '.fuzzyUl li', function () {
        var $this = $(this),
            name = $this.text();
        $this.closest('.fuzzyBox').find('input').val(name);
        $('.fuzzyUl').remove();
    });

    //查询
    $('#J_search').off().on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    });

    //导入
    $('#J_import').on('click', function () {
        $('#J_file').click();
    });

    $('#J_file').on('change', readFile);

    $('#formList')
    //详情
        .on('click', '.J_detail', function () {
            window.open('suppliersAssessDetail.html?idx=' + $(this).data('id'), '', 'channelmode=yes,width=1080,height=800,left=100,top=100');
        })
        // 修改
        .on('click', '.J_update', function () {
            var html = Mustache.render($('#J_tempUpdate').html(), {list: list});
            $('#updateBox').empty().append(html);
        })
        //删除
        .on('click', '.J_delete', function () {
            var $this = $(this),
                idx = $this.data('id');

            //全局变量
            newForms = {};
            newForms.list = [];

            $.each(oldForms.list, function (i) {
                if (this.id == idx) return;
                newForms.list.push(oldForms.list[i]);
            });

            $this.closest('.rowList').remove();
            alert('删除成功，如不再删除其他数据，请点击保存，然后将导出的json文件上传后方能生效');
        });

    //保存
    $('#J_save').on('click', function () {
        funDownload(JSON.stringify(newForms), 'assessmentForms.json');
    });


});

function init() {
    $.ajax({
        type: 'GET',
        url:'../../resource/suppliersAssess/assessmentForms.json'
        // url: '/shili/json/assessmentForms.json'
    }).done(function (data) {
        oldForms = data ? data : {"list": []};

        var list = data.list;
        $.each(list, function (i) {
            list[i].typeName = this.form.situation.type == 1 ? "海外" : "一般贸易";
        });

        //渲染列表
        var html = Mustache.render($('#J_template').html(), {list: list});
        $('#formList').append(html);

    });
}

//查询
function search() {
    var name = $.trim($('#J_name').val()),
        type = $('#J_type').val(),
        grade = $('#J_grade').val();

    $('.rowList').removeClass('hidden');

    if (name == '' && type == '-1' && grade == '-1') return;

    $('.rowList').each(function () {
        var $this = $(this),
            _name = $this.find('.name').text(),
            _type = $this.find('.type').text(),
            _grade = $this.find('.totalGrade').text();

        if (name != '') {
            (name == _name || _name.indexOf(name) != -1) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (type != '-1') {
            (type == _type && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (grade != '-1') {
            (grade == _grade && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }
    });
}

function fuzzySearch($obj) {
    var searchName = $.trim($obj.val()),
        list = [];

    $('.fuzzyUl').remove();
    if (!searchName) return;

    $('.rowList').each(function () {
        var name = $(this).find('.name').text();
        if (name.indexOf(searchName) != -1) {
            list.indexOf(name) == -1 && list.push(name);
        }
    });

    if (list.length == 0) return;

    var html = '<ul class="fuzzy-ul fuzzyUl">';
    $.each(list, function () {
        html += '<li>' + this + '</li>';
    });

    html += '</ul>';

    $obj.after(html);
}

//导出JSON
function funDownload(content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
}

//读取文件
function readFile() {

    var files = $('#J_file').get(0).files;

    $.each(files, function (i) {
        var file = files[i];
        var reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = function (e) {
            var data = e.target.result;
            var wb = XLSX.read(data, {type: "binary"});

            //整理excel数据
            var sheet = wb.Sheets.Sheet1;
            var obj = {},
                form = {},
                situation = {},
                brand = {},
                coordination = {},
                logistics = {},
                compatibility = {};

            situation.type = sheet.F6 ? 1 : 2;
            situation.code = sheet.F6 ? sheet.F6.w : '';

            brand.brandType = sheet.F10 ? sheet.F10.w : '';
            brand.authorization = sheet.L10 ? sheet.L10.w : '';

            coordination.rational = sheet.F17 ? sheet.F17.w : '';
            coordination.paymentDays = sheet.L17 ? sheet.L17.w : '';
            coordination.returnPolicy = sheet.P17 ? sheet.P17.w : '';

            var transportMode = [];
            if (sheet.L25) {
                transportMode.push(sheet.L25.w);
            }
            if (sheet.L27) {
                transportMode.push(sheet.L27.w);
            }
            if (sheet.L29) {
                transportMode.push(sheet.L29.w);
            }

            logistics.deliveryTime = sheet.F25 ? sheet.F25.w : '';
            logistics.transportMode = transportMode;
            logistics.needRushOrder = sheet.P25 ? sheet.P25.w : '';
            logistics.rushOrderRatio = sheet.P27 ? sheet.P27.w : '';
            logistics.preWarningSystem = sheet.F32 ? sheet.F32.w : '';

            var afterSale = [];
            if (sheet.F41) {
                afterSale = sheet.F41.w.split(',');
            }

            compatibility.timeliness = sheet.F36 ? sheet.F36.w : '';
            logistics.supplyRatio = sheet.L36 ? sheet.L36.w : '';
            logistics.needRushOrder = sheet.P36 ? sheet.P36.w : '';
            logistics.giftSupply = sheet.P36 ? sheet.P36.w : '';
            logistics.afterSale = afterSale;

            form.situation = situation;
            form.brand = brand;
            form.coordination = coordination;
            form.logistics = logistics;
            form.compatibility = compatibility;

            obj.name = sheet.C2 ? sheet.C2.w : '';
            obj.legalPerson = sheet.H2 ? sheet.H2.w : '';
            obj.phone = sheet.O2 ? sheet.O2.w : '';
            obj.productName = sheet.C3 ? sheet.C3.w : '';
            obj.productType = sheet.H3 ? sheet.H3.w : '';
            obj.period = sheet.M3 ? sheet.M3.w : '';
            obj.old = sheet.O3 ? sheet.O3.w : '';
            obj.address = sheet.M2 ? sheet.M2.w : '';
            obj.totalScore = sheet.D44 ? sheet.D44.w : '';
            obj.totalGrade = sheet.K44 ? sheet.K44.w : '';

            obj.form = form;

            oldForms.list.push(obj);
        };

        console.log(oldForms)
    });


}