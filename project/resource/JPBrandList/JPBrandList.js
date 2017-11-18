/**
 * Created by dwp on 2017/9/3.
 */

$(document).ready(function () {
    //获取数据
    init();

    //模糊搜索供应商
    $('#J_name,#J_inputName').on('valuechange keyup', function () {
        fuzzySearch(1, $(this));
    });

    //模糊搜素供应链路
    $('#J_link,#J_inputLink').on('valuechange keyup', function () {
        fuzzySearch(2, $(this));
    });

    //选择模糊搜索列表
    $('.bd,#newBox').on('click', '.fuzzyUl li', function () {
        var $this = $(this),
            name = $this.text();
        $this.closest('.fuzzyBox').find('input').val(name);
        $('.fuzzyUl').remove();
    });

    //查询
    $('#J_search').on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    });

    //新增
    $('#J_new').on('click', function () {
        $('#newBox').removeClass('hidden').data('id', $('.rowList').length);
    });

    $('#formList')
    //修改
        .on('click', '.J_update', function () {
            var $this = $(this),
                idx = $this.data('id'),
                $row = $this.closest('.rowList');

            $('#newBox').removeClass('hidden').data('id', idx);
            $('#J_inputName').val($row.find('.name').text());
            $('#J_inputBrand').val($row.find('.brand').text());
            $('.J_newPower[value="' + $row.find('.power').text() + '"]').prop('checked', true);
            $('#J_inputLink').val($row.find('.link').text());
            $('#J_inputRemark').val($row.find('.remark').text());
        })
        //删除
        .on('click', '.J_delete', function () {
            $(this).closest('.rowList').remove();
        });

    //确定新增或修改
    $('#J_sureNew').on('click', function () {

        var idx = $('#newBox').data('id'),
            len = $('.rowList').length,
            name = $.trim($('#J_inputName').val()),
            brand = $.trim($('#J_inputBrand').val()),
            power = $('.J_newPower:checked').val(),
            link = $.trim($('#J_inputLink').val()),
            remark = $.trim($('#J_inputRemark').val());

        if (name == '' && brand == '' && power == '' && link == '' && remark == '') return alert('内容为空，请至少设置一项参数');

        var msg = idx == len ? '新增' : '修改';

        if (!confirm('确定' + msg + '？')) return;

        if (idx == len) {
            //新增
            var obj = [];
            obj[0] = {};
            obj[0].id = $('#newBox').data('id');
            obj[0].name = name;
            obj[0].brand = brand;
            obj[0].power = power;
            obj[0].link = link;
            obj[0].remark = remark;

            var html = Mustache.render($('#J_template').html(), {list: obj});
            $('#formList .row').eq(0).after(html);
        } else {
            //修改
            var $row = $('.rowList[data-id="' + idx + '"]');
            $row.find('.name').text(name);
            $row.find('.brand').text(brand);
            $row.find('.power').text(power);
            $row.find('.link').text(link);
            $row.find('.remark').text(remark);
        }

        _cancel();
    });

    //取消新增
    $('#J_cancelNew').on('click', function () {
        _cancel();
    });
    $(document).on('click', function (e) {
        var $target = $(e.target);
        if ($target.closest('.container-new,#J_new,.J_update,.fuzzyUl').length == 0) {
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
            result[i].name = $this.find('.name').text();
            result[i].brand = $this.find('.brand').text();
            result[i].power = $this.find('.power').text();
            result[i].link = $this.find('.link').text();
            result[i].remark = $this.find('.remark').text();
        });
        list.result = result;
        list.success = true;
        funDownload(JSON.stringify(list), 'JPBrandList.json');
        alert('请至 "上传" 菜单栏上传 "JPBrandList.json" 文件');
    });
});

function init() {
    $.ajax({
        type: 'GET',
        url: '/shili/json/JPBrandList.json'
    }).done(function (data) {
        if (data && data.success) {

            //品牌列表
            var brandAttr = [];
            var brandList = '<option value="-1">--全部--</option>';
            $.each(data.result, function (i) {
                this.name = $.trim(this.name);
                this.brand = $.trim(this.brand);
                this.power = $.trim(this.power);
                this.link = $.trim(this.link);
                this.remark = $.trim(this.remark);
                this.id = i;

                if (brandAttr[this.brand]) return true;

                brandAttr[this.brand] = this.brand;
                brandList += '<option value="' + this.brand + '">' + this.brand + '</option>'
            });

            $('#J_brand').empty().append(brandList).selectPicker();

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
    var name = $.trim($('#J_name').val()).toLowerCase(),
        brand = $('#J_brand').val(),
        power = $('.J_power:checked').val(),
        link = $.trim($('#J_link').val());

    $('.rowList').removeClass('hidden');

    if (name == '' && brand == '-1' && power == '-1' && link == '') return;

    $('.rowList').each(function () {
        var $this = $(this),
            _name = $this.find('.name').text().toLowerCase(),
            _brand = $this.find('.brand').text(),
            _power = $this.find('.power').text(),
            _link = $this.find('.link').text();

        if (name != '') {
            (name == _name || _name.indexOf(name) != -1) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (brand != '-1') {
            (brand == _brand && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (power != '-1') {
            (power == _power && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');
        }

        if (link != '') {
            (link == _link && !$this.hasClass('hidden')) ? $this.removeClass('hidden') : $this.addClass('hidden');

        }
    });
}

/*
 * 模糊搜索
 * type: 1--> 供应商  2--> 供应链路
 */
function fuzzySearch(type, $obj) {
    var searchName = $.trim($obj.val()),
        list = [];

    $('.fuzzyUl').remove();
    if (!searchName) return;

    var iClass = type == 1 ? '.name' : '.link';

    $('.rowList').each(function () {
        var name = $(this).find(iClass).text();
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

function _cancel() {
    $('#J_inputName').val('');
    $('#J_inputBrand').val('');
    $('#J_inputLink').val('');
    $('#J_inputRemark').val('');
    $('#newBox').addClass('hidden');
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