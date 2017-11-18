/**
 * Created by Eric on 17/11/13.
 */

$(document).ready(function () {

    $('#formList')
    //详情
        .on('click', '.J_detail', function () {
            window.open('suppliersAssessDetail.html?idx=' + $(this).data('id'), '', 'channelmode=yes,width=1080,height=800,left=100,top=100');
        })
        // 修改
        .on('click', '.J_update', function () {

            var idx = $(this).data('id');

            var list = {};

            $.each(oldForms.list, function (i) {
                if (this.id == idx) {
                    list = oldForms.list[i];

                }
            });

            var html = Mustache.render($('#J_tempUpdate').html(), list);
            $('#updateLayout').removeClass('hidden').empty().append(html);

            //渲染fieldset
            $.each(list.form, function (item, result) {
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
            judgeSupplierType(list.form.situation.type);
        })
        //删除
        .on('click', '.J_delete', function () {
            var $this = $(this),
                idx = $this.data('id');

            $this.closest('.rowList').remove();
            $.each(oldForms.list, function (i) {
                if (this.id == idx) {
                    oldForms.list.splice(i, 1);
                }
            });
            alert('删除成功');
        });

    $('#updateLayout')
    //选择供应商类型
        .on('click', '.J_type', function () {
            var type = $(this).val();
            judgeSupplierType(type);
        })
        //选择radio,计算得分和等级
        .on('click', '.J_radio', total)
        //保存修改
        .on('click', '#J_tempSave', function () {
            var idx = $(this).data('id');
            updateForms(idx);
        });

    //点击空白
    $(document).on('click', function (e) {
        var $target = $(e.target);
        if ($target.closest('.updateBox,.J_update').length == 0) {
            $('#updateLayout').empty().addClass('hidden');
        }
    });

});

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

//计算得分和等级
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
    var $rowList = $('.rowList[data-id="' + idx + '"]'),
        obj = {},
        form = {},
        updateRecord = [],
        record = {},
        oldScore = '',
        oldGrade = '';

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
    obj.typeName = $('.J_type:checked').val() == 1 ? "海外" : "一般贸易";
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

    $rowList.find('.name').text(obj.name);
    $rowList.find('.type').text(obj.typeName);
    $rowList.find('.totalGrade').text(obj.totalGrade);
    $rowList.find('.totalScore').text(obj.totalScore);

    $.each(oldForms.list, function (i) {
        if (this.id == idx) {
            //记录修改历史
            _updateHistory(oldForms.list[i], obj);
            obj.updateRecordList = oldForms.list[i].updateRecordList || [];

            if (updateRecord.length != 0) {
                record.recordList = updateRecord;
                record.t = new Date().format('YYYY-MM-DD hh:mm');
                record.oldScore = oldScore;
                record.oldGrade = oldGrade;
                record.newScore = obj.totalScore;
                record.newGrade = obj.totalGrade;
                obj.updateRecordList.push(record);
            }

            oldForms.list[i] = obj;
        }
    });

    $('#updateLayout').addClass('hidden');

    //记录修改历史
    function _updateHistory(list, obj, out) {
        $.each(list, function (k, v) {
            if (k == 'updateRecordList' || k == 'recordList' || k == 'typeName') return;
            if (k == 'totalScore') return oldScore = v;
            if (k == 'totalGrade') return oldGrade = v;


            if (v != obj[k] && typeof v != 'object') {
                updateRecord.push({
                    name: out ? out + '.' + k : k,
                    oldMsg: v,
                    nowMsg: obj[k]
                });
            }

            if ($.isArray(v) && v.sort().toString() != obj[k].sort().toString()) {
                updateRecord.push({
                    name: out ? out + '.' + k : k,
                    oldMsg: v,
                    nowMsg: obj[k]
                });
            }

            if (!$.isArray(v) && typeof v == 'object') {
                _updateHistory(v, obj[k], k)
            }
        });
    }
}

