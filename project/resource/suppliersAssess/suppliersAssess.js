/**
 * Created by Eric on 17/11/10.
 */

$(document).ready(function () {
    init();

    //模糊搜索供应商
    $('#J_name').on('valuechange keyup', function () {
        fuzzySearch($(this));
    });

    //查询
    $('#J_search').off().on('click', search);
    $('#formSubmit').on('keyup', function (e) {
        e.keyCode == 13 && search();
    });


});

function init() {
    $.ajax({
        type: 'GET',
        url: '../../resource/suppliersAssess/assessmentForms.json'
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