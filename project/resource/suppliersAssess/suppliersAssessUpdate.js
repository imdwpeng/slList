/**
 * Created by Eric on 17/11/10.
 */

$(document).ready(function () {
    var idx = window.location.search.substring(1).split('=')[1];

    !idx && $("#J_tempSave,#noteMsg").removeClass('hidden');

    init(idx);

    //选择供应商类型
    $('.J_type').on('click', function () {
        var type = $(this).val();
        judgeSupplierType(type);
    });

    //选择radio,计算得分和等级
    $('.J_radio').on('click', total);

    //临时保存，用于批量新增，避免每次保存就导出一个json
    $('#J_tempSave').on('click', function () {
        var ifSure = true;
        $('.radioList').each(function () {
            var $this = $(this),
                $rowBox = $this.closest('.row');

            $rowBox.removeClass('no-choice');
            if ($this.find('input[type="radio"]:checked').length != 0) return;
            $rowBox.addClass('no-choice');
            ifSure = false;
        });

        if (!ifSure) return alert('存在未选择的项目，请选择后再保存');

        updateForms(idx);
        alert('临时保存成功，请添加下一条，请勿刷新页面，如想结束添加，可直接点击保存按钮，导出assessmentForms.json文件');

        $('input[type="text"],textarea').val('');
        $('input[type="radio"],input[type="checkbox"]').prop('checked', false);
        $('#totalSituation').addClass('hidden');
    });

    //保存
    $('#J_save').on('click', function () {

        var ifSure = true;
        $('.radioList').each(function () {
            var $this = $(this),
                $rowBox = $this.closest('.row');

            $rowBox.removeClass('no-choice');
            if ($this.find('input[type="radio"]:checked').length != 0) return;
            $rowBox.addClass('no-choice');
            ifSure = false;
        });

        if (!ifSure && !confirm('存在未选择的项目，确定放弃本次添加，并保存之前添加的评估？')) return;

        updateForms(idx);

        funDownload(JSON.stringify(oldForms), 'assessmentForms.json');
        alert('保存成功，需将导出的json文件上传后方能生效');
    });
});

function init(idx) {
    $.ajax({
        type: 'GET',
        url: '/shili/json/assessmentForms.json'
    }).done(function (data) {
        oldForms = data ? data : {"list": []};

        idx && renderOldMsg(idx, data.list);

    });
}

//渲染修改页面内容
function renderOldMsg(idx, list) {
    var nowForm = {};
    $.each(list, function (i) {
        if (this.id == idx) {
            nowForm = list[i];
        }
    });

    //渲染基本信息
    $.each(nowForm, function (k, v) {
        $('input[name="' + k + '"]').val(v);
        $('textarea[name="' + k + '"]').val(v);
    });

    //渲染fieldset
    $.each(nowForm.form, function (item, result) {
        var $fieldset = $('fieldset[data-item="' + item + '"]');
        $.each(result, function (k, v) {
            //渲染单选框
            $fieldset.find('.rowList[data-type="' + k + '"] input[data-no="' + v + '"]').prop('checked', true);

            //渲染多选框
            if (typeof v == "object") {
                $.each(v, function () {
                    $fieldset.find('.rowList[data-type="' + k + '"] input[data-no="' + this + '"]').prop('checked', true);
                });
            }
        });
    });
    judgeSupplierType(nowForm.form.situation.type);
    total();
}

/*
 * 判断供应商类型
 * 海外  --> 总体情况5%
 *          品牌优势30%
 * 一般贸易 --> 总体情况0%
 *             品牌优势35%
 *
 */
function judgeSupplierType(type) {
    $('#brandField').removeClass('hidden');
    switch (type) {
        case 1:
        case "1":
            $('#totalSituation').removeClass('hidden');
            $('#totalField').data('ratio', $('#totalField').data('ratio-1'));
            $('#brandField').data('ratio', $('#brandField').data('ratio-1'));
            break;
        default:
            $('#totalSituation').addClass('hidden');
            $('#totalField').data('ratio', $('#totalField').data('ratio-2'));
            $('#brandField').data('ratio', $('#brandField').data('ratio-2'));
            break;
    }
}

function total() {
    var totalScore = 0,
        totalGrade = 'D';

    $('.J_radio:checked').each(function () {
        var $this = $(this),
            grade = $this.data('grade'),
            ratio = ($this.closest('fieldset').data('ratio') - 0) / 100;
        totalScore += grade * ratio;
    });

    totalGrade = totalScore < 65
        ? 'D'
        : (totalScore >= 65 && totalScore < 75)
            ? 'C'
            : (totalScore >= 75 && totalScore < 85)
                ? 'B'
                : 'A';

    $('#totalScore').text(totalScore.toFixed(2));
    $('#totalGrade').text(totalGrade);
}

//更新oldForms数据
function updateForms(idx) {
    var obj = {},
        form = {};

    $('fieldset:not(.basic-msg)').each(function () {
        var $this = $(this),
            item = $this.data('item');

        form[item] = {};
        $this.find('.rowList').each(function () {
            var _this = $(this),
                type = _this.data('type'),
                no = _this.find('.J_radio:checked').data('no');

            //多选
            if (_this.find('.J_radio[type="checkbox"]').length != 0) {
                no = [];
                _this.find('.J_radio[type="checkbox"]:checked').each(function () {
                    no.push($(this).data('no'));
                });
            }

            form[item][type] = no;
        });
    });

    obj.id = idx || oldForms.list.length + 1;
    obj.name = $.trim($('#J_name').val());
    obj.legalPerson = $.trim($('#J_legalPerson').val());
    obj.phone = $.trim($('#J_phone').val());
    obj.productName = $.trim($('#J_productName').val());
    obj.productType = $.trim($('#J_productType').val());
    obj.period = $.trim($('#J_period').val());
    obj.old = $.trim($('#J_old').val());
    obj.address = $.trim($('#J_address').val());
    obj.totalScore = $('#totalScore').text();
    obj.totalGrade = $('#totalGrade').text();
    obj.form = form;

    if (idx) {
        $.each(oldForms.list, function (i) {
            if (this.id == idx) {
                oldForms.list[i] = obj;
            }
        });
    } else {
        oldForms.list.push(obj);
    }
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

























