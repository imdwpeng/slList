/**
 * Created by dwp on 2017/9/3.
 */

$(document).ready(function () {
    //获取数据
    $.ajax({
        type: 'GET',
        url: '../../resource/JPBrandList/JPBrandList.json'
    }).done(function (data) {
        if (data && data.success) {

            //品牌列表
            var brandAttr = [];
            var brandList = '<option value="-1">--全部--</option>';
            $.each(data.result, function () {
                this.name = $.trim(this.name);
                this.brand = $.trim(this.brand);
                this.power = $.trim(this.power);
                this.link = $.trim(this.link);
                this.remark = $.trim(this.remark);

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

    //查询
    $('#J_search').on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    })
});

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