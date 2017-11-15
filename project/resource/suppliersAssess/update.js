/**
 * Created by Eric on 17/11/13.
 */

$(document).ready(function () {

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

            obj.id = oldForms.list.length + 1;
            obj.typeName = sheet.F6 ? "海外" : "一般贸易";
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

            //根据供应商名称判断是否存在该供应商
            var ifRepeat = false;
            $.each(oldForms.list, function () {
                if (this.name == obj.name) {
                    ifRepeat = true;
                }
            });

            if (ifRepeat) return alert('"' + obj.name + '" 供应商已存在，请检查 "' + file.name + '"', 'failType');

            //渲染列表
            var html = Mustache.render($('#J_template').html(), {list: obj});
            $('#formList').append(html);
            alert('"' + file.name + '" 导入成功');
            setTimeout(function () {
                $('.alert.color7-bg').remove();
            }, 3000);

            //更新全局保存的数据
            oldForms.list.push(obj);
        };
    });


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
    $rowList.find('.type').text(obj.form.situation.type);
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
                console.log(k, v, obj[k], out)
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

