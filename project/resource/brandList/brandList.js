/**
 * Created by dwp on 2017/9/3.
 */

$(document).ready(function () {
    //获取数据
    init();

    //查询
    $('#J_search').off().on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    })

    //新增
    $('#J_new').on('click', function () {
        $('#newBox').removeClass('hidden').data('id', $('.rowList').length);
    });

    $('#formList')
    //修改
        .on('click', '.J_update', function () {
            var $this = $(this),
                idx = $this.data('id'),
                $row = $this.closest('.rowList'),
                countryAttr = $row.find('.country').text().split(' '),
                warehouseAttr = $row.find('.warehouse').text().split(' ');

            $('#newBox').removeClass('hidden').data('id', idx);
            $('#J_inputCountry').val(countryAttr[0]).selectPicker();
            $('#J_inputName').val($row.find('.name').text()).selectPicker();
            $('#J_inputCode').val($row.find('.code').text()).selectPicker();
            $('#J_inputTimeLimit').val($row.find('.timeLimit').text()).selectPicker();
            $('.J_inputType[value="' + $row.find('.type').text() + '"]').prop('checked', true);
            $('#J_inputBrand').val($row.find('.brand').text());
            $('#J_inputWarehouse').val(warehouseAttr[0]);

            var countryList = '';
            $.each(countryAttr, function () {
                if (this == '') return;
                countryList += '<span class="selected-item selectedItem">' + this + '</span>';
            });
            $('#J_selectedCountry').empty().append(countryList);

            var warehouseList = '';
            $.each(warehouseAttr, function () {
                if (this == '') return;
                warehouseList += '<span class="selected-item selectedItem" title="删除">' + this + '</span>';
            });
            $('#J_selectedWarehouse').empty().append(warehouseList);

        })
        //删除
        .on('click', '.J_delete', function () {
            $(this).closest('.rowList').remove();
        });

    //擅长国家多选
    $('#J_inputCountry').on('change', function () {
        var item = $(this).val(),
            $obj = $('#J_selectedCountry');

        multipleChoice(item, $obj);
    });

    //海外仓库多选
    $('#J_inputWarehouse').on('change', function () {
        var item = $(this).val(),
            $obj = $('#J_selectedWarehouse');

        multipleChoice(item, $obj);
    });

    //删除多选
    $('#newBox').on('click', '.selectedItem', function () {
        $(this).remove();
    });

    //确定新增或修改
    $('#J_sureNew').on('click', function () {

        var idx = $('#newBox').data('id'),
            len = $('.rowList').length,
            country = '',
            name = $.trim($('#J_inputName').val()) != -1 ? $.trim($('#J_inputName').val()) : '',
            code = $.trim($('#J_inputCode').val()) != -1 ? $.trim($('#J_inputCode').val()) : '',
            timeLimit = $.trim($('#J_inputTimeLimit').val()) != -1 ? $.trim($('#J_inputTimeLimit').val()) : '',
            brand = $.trim($('#J_inputBrand').val()),
            warehouse = '',
            type = $.trim($('.J_inputType:checked').val());

        $('#J_selectedCountry .selectedItem').each(function () {
            country += ' ' + $(this).text();
        });
        country = $.trim(country);

        $('#J_selectedWarehouse .selectedItem').each(function () {
            warehouse += ' ' + $(this).text();
        });
        warehouse = $.trim(warehouse);

        if (country == '' && name == '' && code == '' && timeLimit == '' && brand == '' && warehouse == '' && type == '') return alert('内容为空，请至少设置一项参数');

        var msg = idx == len ? '新增' : '修改';

        if (!confirm('确定' + msg + '？')) return;

        if (idx == len) {
            //新增
            var obj = [];
            obj[0] = {};
            obj[0].id = $('#newBox').data('id');
            obj[0].country = country;
            obj[0].name = name;
            obj[0].code = code;
            obj[0].timeLimit = timeLimit;
            obj[0].brand = brand;
            obj[0].warehouse = warehouse;
            obj[0].type = type;

            var html = Mustache.render($('#J_template').html(), {list: obj});
            $('#formList .row').eq(0).after(html);
        } else {
            //修改
            var $row = $('.rowList[data-id="' + idx + '"]');
            $row.find('.country').text(country);
            $row.find('.name').text(name);
            $row.find('.code').text(code);
            $row.find('.timeLimit').text(timeLimit);
            $row.find('.brand').text(brand);
            $row.find('.warehouse').text(warehouse);
            $row.find('.type').text(type);
        }

        _cancel();
    });

    //取消新增
    $('#J_cancelNew').on('click', function () {
        _cancel();
    });
    $(document).on('click', function (e) {
        var $target = $(e.target);
        if ($target.closest('.container-new,#J_new,.J_update,.selectedItem').length == 0) {
            _cancel();
        }
    });

    //保存
    //提交商品信息，变成JSON数据
    $('#J_save').on('click', function () {
        var list = {},
            result = [];

        $('.rowList').each(function (i) {
            var $this = $(this);

            result[i] = {};
            result[i].country = $this.find('.country').text();
            result[i].name = $this.find('.name').text();
            result[i].code = $this.find('.code').text();
            result[i].timeLimit = $this.find('.timeLimit').text();
            result[i].type = $this.find('.type').text();
            result[i].brand = $this.find('.brand').text();
            result[i].warehouse = $this.find('.warehouse').text();
        });
        list.result = result;
        list.success = true;
        funDownload(JSON.stringify(list), 'brandList.json');
        alert('请至 "上传" 菜单栏上传 "brandList.json" 文件');
    });
});

function init() {
    $.ajax({
        type: 'GET',
        url: '/shili/json/brandList.json'
    }).done(function (data) {
        if (data && data.success) {

            var nameAttr = [],
                codeAttr = [],
                timeLimitAttr = [];

            var nameList = '<option value="-1">--全部--</option>',
                codeList = '<option value="-1">--全部--</option>',
                timeLimitList = '<option value="-1">--全部--</option>';

            $.each(data.result, function (i) {
                this.id = i;
                this.country = $.trim(this.country);
                this.name = $.trim(this.name);
                this.code = $.trim(this.code);
                this.type = $.trim(this.type);
                this.timeLimit = $.trim(this.timeLimit);
                this.brand = $.trim(this.brand);
                this.warehouse = $.trim(this.warehouse);

                //供应商列表
                if (!nameAttr[this.name]) {
                    nameAttr[this.name] = this.name;
                    nameList += '<option value="' + this.name + '">' + this.name + '</option>';
                }

                //供应商代码
                if (!codeAttr[this.code]) {
                    codeAttr[this.code] = this.code;
                    codeList += '<option value="' + this.code + '">' + this.code + '</option>';
                }

                //账期
                if (!timeLimitAttr[this.timeLimit]) {
                    timeLimitAttr[this.timeLimit] = this.code;
                    timeLimitList += '<option value="' + this.timeLimit + '">' + this.timeLimit + '</option>';
                }
            });

            $('#J_name,#J_inputName').empty().append(nameList).selectPicker();
            $('#J_code,#J_inputCode').empty().append(codeList).selectPicker();
            $('#J_timeLimit,#J_inputTimeLimit').empty().append(timeLimitList).selectPicker();

            //渲染列表
            var html = Mustache.render($('#J_template').html(), {list: data.result});
            $('#formList').append(html);
        }
    }).fail(function () {
        alert('查询失败');
    });

}

//查询
function search() {
    var name = $.trim($('#J_name').val()),
        country = $('#J_country').val(),
        code = $('#J_code').val(),
        timeLimit = $('#J_timeLimit').val(),
        type = $('.J_type:checked').val(),
        warehouse = $('#J_warehouse').val();

    $('.rowList').removeClass('hidden');

    if (name == '' && country == '-1' && code == '-1' && timeLimit == '-1' && power == '-1' && warehouse == '') return;

    $('.rowList').each(function () {
        var $this = $(this),
            _name = $this.find('.name').text(),
            _country = $this.find('.country').text(),
            _code = $this.find('.code').text(),
            _timeLimit = $this.find('.timeLimit').text(),
            _type = $this.find('.type').text(),
            _warehouse = $this.find('.warehouse').text();

        if (country != '-1') {
            _country.indexOf(country) != '-1' ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (name != '-1') {
            (name == _name && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (code != '-1') {
            (code == _code && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (timeLimit != '-1') {
            (timeLimit == _timeLimit && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (type != '-1') {
            (type == _type && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (warehouse != '-1') {
            (_warehouse.indexOf(warehouse) != '-1' && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }
    });
}

function _cancel() {
    $('#J_inputCountry').val('-1').selectPicker();
    $('#J_inputName').val('-1').selectPicker();
    $('#J_inputCode').val('-1').selectPicker();
    $('#J_inputTimeLimit').val('-1').selectPicker();
    $('#J_inputWarehouse').val('-1').selectPicker();
    $('#J_selectedCountry,#J_selectedWarehouse').empty();
    $('#J_inputBrand').val('');
    $('#newBox').addClass('hidden');
}

//多选
function multipleChoice(item, $obj) {
    var html = '<span class="selected-item selectedItem" title="删除">' + item + '</span>';

    if (item == -1) return;

    var ifRepeat = false;
    $obj.find('.selectedItem').each(function () {
        if ($(this).text() == item) {
            ifRepeat = true;
        }
    });
    !ifRepeat && $obj.append(html);
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
