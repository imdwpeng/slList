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

    //新增
    $('#J_new').winOpen({
        url: function () {
            return 'suppliersAssessUpdate.html';
        },
        width: 1080,
        height: 800
    });

    $('#formList')
    // 修改
        .on('click', '.J_update', function () {
            window.open('suppliersAssessUpdate.html?idx=' + $(this).data('id'), '', 'channelmode=yes,width=1080,height=800,left=100,top=100');
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
        });

    //保存
    $('#J_save').on('click', function () {
        funDownload(JSON.stringify(newForms), 'assessmentForms.json');
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