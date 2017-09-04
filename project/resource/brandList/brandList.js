/**
 * Created by dwp on 2017/9/3.
 */

$(document).ready(function () {
    //获取数据
    $.ajax({
        type: 'GET',
        url: '../../resource/brandList/brandList.json'
    }).done(function (data) {
        if (data && data.success) {

            var nameAttr = [],
                codeAttr = [],
                timeLimitAttr = [];

            var nameList = '<option value="-1">--全部--</option>',
                codeList = '<option value="-1">--全部--</option>',
                timeLimitList = '<option value="-1">--全部--</option>';

            $.each(data.result, function () {
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

            $('#J_name').empty().append(nameList).selectPicker();
            $('#J_code').empty().append(codeList).selectPicker();
            $('#J_timeLimit').empty().append(timeLimitList).selectPicker();

            //渲染列表
            var html = Mustache.render($('#J_template').html(), {list: data.result});
            $('#formList').append(html);
        }
    }).fail(function () {
        alert('查询失败');
    });

    //查询
    $('#J_search').off().on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    })
});

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