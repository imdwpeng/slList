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

    //保存
    $('#J_save').on('click', function () {
        funDownload(JSON.stringify(oldForms), 'assessmentForms.json');
    });

    //多选
    $('.J_allCheck').on('click', function () {
        var checked = $(this).prop('checked');
        $('.J_check').prop('checked', checked);

        checked ? $('#J_export').removeClass('hidden') : $('#J_export').addClass('hidden');
    });

    //单选
    $('#formList').on('click', '.J_check', function () {
        var len = $('.J_check:checked').length;
        len == $('.J_check').length ? $('.J_allCheck').prop('checked', true) : $('.J_allCheck').prop('checked', false);
        len ? $('#J_export').removeClass('hidden') : $('#J_export').addClass('hidden');
    });

    //导出
    $('#J_export').on('click', function () {
        var idxAttr = [];

        $('.J_check:checked').each(function () {
            idxAttr.push($(this).data('id'));
        });
        downloadExl(idxAttr);
    });

});

function init() {
    oldForms = {"list": []};
    $.ajax({
        type: 'GET',
        url: '/shili/json/assessmentForms.json'
    }).done(function (data) {
        oldForms = data;

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
            situation.case = sheet.F6 ? sheet.F6.w.split(',') : '';

            brand.brandType = sheet.F10 ? sheet.F10.w : '';
            brand.authorization = sheet.L10 ? sheet.L10.w : '';

            coordination.rational = sheet.F17 ? sheet.F17.w : '';
            coordination.paymentDays = sheet.L17 ? sheet.L17.w : '';
            coordination.returnPolicy = sheet.P17 ? sheet.P17.w : '';

            var transportMode = [];
            if (sheet.L25) {
                $.each(sheet.L25.w.split(','), function (i) {
                    transportMode.push(i + 1 + this);
                })
            }

            logistics.deliveryTime = sheet.F25 ? sheet.F25.w : '';
            logistics.transportMode = transportMode;
            logistics.needRushOrder = sheet.P25 ? sheet.P25.w.split(',')[0] : '';
            logistics.rushOrderRatio = sheet.P25 ? sheet.P25.w.split(',')[1] : '';
            logistics.preWarningSystem = sheet.F32 ? sheet.F32.w : '';

            var afterSale = [];
            if (sheet.F41) {
                afterSale = sheet.F41.w.split(',');
            }

            compatibility.timeliness = sheet.F36 ? sheet.F36.w : '';
            compatibility.supplyRatio = sheet.L36 ? sheet.L36.w : '';
            compatibility.giftSupply = sheet.P36 ? sheet.P36.w : '';
            compatibility.giftSupply = sheet.P36 ? sheet.P36.w : '';
            compatibility.afterSale = afterSale;

            form.situation = situation;
            form.brand = brand;
            form.coordination = coordination;
            form.logistics = logistics;
            form.compatibility = compatibility;

            obj.id = oldForms.list.length + 1;
            obj.typeName = sheet.F6.w ? "海外" : "一般贸易";
            obj.name = sheet.C2 ? sheet.C2.w : '';
            obj.legalPerson = sheet.H2 ? sheet.H2.w : '';
            obj.phone = sheet.O2 ? sheet.O2.w : '';
            obj.productName = sheet.C3 ? sheet.C3.w : '';
            obj.productType = sheet.H3 ? sheet.H3.w : '';
            obj.period = sheet.M3 ? sheet.M3.w : '';
            obj.old = sheet.O3 ? sheet.O3.w : '';
            obj.address = sheet.M2 ? sheet.M2.w : '';

            obj.form = form;

            _initTotal(obj);

            console.log(obj)
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

    //计算得分和等级
    function _initTotal(data) {
        var totalScore = 0,
            totalGrade = 'D',
            form = data.form;

        var scroeList = {
            score: {
                situation: {
                    type: {
                        "1": 0,
                        "2": 0
                    },
                    case: {
                        "1": 10,
                        "2": 45,
                        "3": 45
                    }
                },
                brand: {
                    brandType: {
                        "1": 60,
                        "2": 50,
                        "3": 40,
                        "4": 30,
                        "15": 0
                    },
                    authorization: {
                        "1": 40,
                        "2": 0
                    }
                },
                coordination: {
                    "rational": {
                        "1": 40,
                        "2": 20,
                        "3": 0
                    },
                    "paymentDays": {
                        "1": 30,
                        "2": 20,
                        "3": 15,
                        "4": 5,
                        "5": 3,
                        "6": 0
                    },
                    "returnPolicy": {
                        "1": 30,
                        "2": 15,
                        "3": 0
                    }
                },
                logistics: {
                    "deliveryTime": {
                        "1": 50,
                        "2": 40,
                        "3": 20,
                        "4": 0
                    },
                    "transportMode": {
                        "1A": 7,
                        "2A": 7,
                        "3A": 6,
                        "1B": 0,
                        "2B": 0,
                        "3B": 0
                    },
                    "needRushOrder": {
                        "A": 10,
                        "B": 0
                    },
                    "rushOrderRatio": {
                        "A": 10,
                        "B": 5
                    },
                    "preWarningSystem": {
                        "A": 10,
                        "B": 0
                    }
                },
                compatibility: {
                    "timeliness": {
                        "1": 10,
                        "2": 5,
                        "3": 0
                    },
                    "supplyRatio": {
                        "1": 25,
                        "2": 0
                    },
                    "giftSupply": {
                        "1": 25,
                        "2": 10,
                        "3": 0
                    },
                    "afterSale": {
                        "1": 15,
                        "2": 15,
                        "3": 10
                    }
                }
            },
            ratio: {
                brand: form.situation.type == 1 ? 25 : 35,
                situation: form.situation.type == 1 ? 10 : 0,
                coordination: 35,
                logistics: 15,
                compatibility: 15
            }
        };

        $.each(form, function (key, obj) {
            $.each(obj, function (k, v) {
                if (typeof v == 'object') {
                    $.each(v, function () {
                        totalScore += scroeList.ratio[key] * scroeList.score[key][k][this];
                    });
                } else {
                    totalScore += scroeList.ratio[key] * scroeList.score[key][k][v];
                }
            });
        });
        totalScore = totalScore / 100;

        totalGrade = totalScore < 65
            ? 'D'
            : (totalScore >= 65 && totalScore < 75)
                ? 'C'
                : (totalScore >= 75 && totalScore < 85)
                    ? 'B'
                    : 'A';

        data.totalScore = totalScore.toFixed(2);
        data.totalGrade = totalGrade;
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

//导出excel
function downloadExl(idxAttr) {
    //这里的数据是用来定义导出的格式类型
    var wopts = {bookType: 'xlsx', bookSST: true, type: 'binary', cellStyles: true};
    var wb = {SheetNames: ['Sheet1'], Sheets: {}, Props: {}};

    $.each(idxAttr, function (i) {
        var data = {},
            idx = idxAttr[i],
            list = {};

        $.each(oldForms.list, function (j) {
            if (this.id == idx) {
                list = oldForms.list[j];
            }
        });

        model(data);

        content(data, list);

        //excel样式
        for (var i in data) {
            if (!data[i].s) {
                if (data[i].w != "") {
                    data[i].s = {
                        alignment: {vertical: "center", horizontal: "center", wrapText: "true"},
                        font: {sz: 10, name: "宋体", bold: true}
                    };
                } else {
                    data[i].s = {
                        alignment: {vertical: "center", horizontal: "center", wrapText: "true"},
                        font: {sz: 10, name: "宋体"}
                    };
                }
            }
        }

        wb.Sheets['Sheet1'] = data;

        var obj = new Blob([s2ab(XLSX.write(wb, wopts))], {type: "application/octet-stream"}),
            fileName = list.name + '供应商评估表' + '.' + (wopts.bookType == "biff2" ? "xls" : wopts.bookType);

        saveAs(obj, fileName);
    });
}

//excel模板
function model(data) {
    data["A1"] = {
        "t": "s",
        "v": "新供应商评估表1",
        "r": "新供应商评估表",
        "h": "新供应商评估表",
        "w": "新供应商评估表4",
        "s": {
            alignment: {vertical: "center", horizontal: "center", wrapText: "true"},
            font: {sz: 16, name: "宋体", bold: true}
        }
    };


    data["A2"] = {
        "t": "s",
        "v": "供应商名称",
        "r": "<t>供应商名称</t>",
        "h": "供应商名称",
        "w": "供应商名称"
    };
    data["E2"] = {
        "t": "s",
        "v": "法人代表",
        "r": "<t>法人代表</t>",
        "h": "法人代表",
        "w": "法人代表"
    };
    data["J2"] = {
        "t": "s",
        "v": "地址",
        "r": "<t>地址</t>",
        "h": "地址",
        "w": "地址"
    };
    data["N2"] = {
        "t": "s",
        "v": "联系方式",
        "r": "<t>联系方式</t>",
        "h": "联系方式",
        "w": "联系方式"
    };
    data["A3"] = {
        "t": "s",
        "v": "产品名称",
        "r": "<t>产品名称</t>",
        "h": "产品名称",
        "w": "产品名称"
    };
    data["E3"] = {
        "t": "s",
        "v": "产品品类",
        "r": "<t>产品品类</t>",
        "h": "产品品类",
        "w": "产品品类"
    };
    data["J3"] = {
        "t": "s",
        "v": "供货周期",
        "r": "<t>供货周期</t>",
        "h": "供货周期",
        "w": "供货周期"
    };
    data["N3"] = {
        "t": "s",
        "v": "原有供应商情况",
        "r": "<t>原有供应商情况</t>",
        "h": "原有供应商情况",
        "w": "原有供应商情况"
    };
    data["A4"] = {
        "t": "s",
        "v": "评项",
        "r": "<t>评项</t>",
        "h": "评项",
        "w": "评项"
    };
    data["B4"] = {
        "t": "s",
        "v": "海外供应商总体情况（100分）",
        "r": "<t>海外供应商总体情况（100分）</t>",
        "h": "海外供应商总体情况（100分）",
        "w": "海外供应商总体情况（100分）"
    };
    data["F4"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["G4"] = {
        "t": "s",
        "v": "一般贸易供应商总体情况（100分）",
        "r": "<t>一般贸易供应商总体情况（100分）</t>",
        "h": "一般贸易供应商总体情况（100分）",
        "w": "一般贸易供应商总体情况（100分）"
    };
    data["L4"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["A6"] = {
        "t": "s",
        "v": "供应商总体情况（5%）",
        "r": "<t>供应商总体情况（5%）</t>",
        "h": "供应商总体情况（5%）",
        "w": "供应商总体情况（5%）"
    };
    data["B6"] = {
        "t": "s",
        "v": "1. 央企资金支持（10分）",
        "r": "<t>1. 央企资金支持（10分）</t>",
        "h": "1. 央企资金支持（10分）",
        "w": ""
    };
    data["G6"] = {
        "t": "s",
        "v": "品牌优势增加到35%",
        "r": "<t>品牌优势增加到35%</t>",
        "h": "品牌优势增加到35%",
        "w": ""
    };
    data["B7"] = {
        "t": "s",
        "v": "2. 海外有自己仓库原产国有自己仓库（45分）",
        "r": "<t>2. 海外有自己仓库原产国有自己仓库（45分）</t>",
        "h": "2. 海外有自己仓库原产国有自己仓库（45分）",
        "w": ""
    };
    data["B8"] = {
        "t": "s",
        "v": "3. 海外有自己的BD团队或员工（45分）",
        "r": "<t>3. 海外有自己的BD团队或员工（45分）</t>",
        "h": "3. 海外有自己的BD团队或员工（45分）",
        "w": ""
    };
    data["A9"] = {
        "t": "s",
        "v": "品牌优势（30%）",
        "r": "<t>品牌优势（30%）</t>",
        "h": "品牌优势（30%）",
        "w": "品牌优势（30%）"
    };
    data["B9"] = {
        "t": "s",
        "v": "品牌地位（60分）",
        "r": "<t>品牌地位（60分）</t>",
        "h": "品牌地位（60分）",
        "w": "品牌地位（60分）"
    };
    data["F9"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["G9"] = {
        "t": "s",
        "v": "授权（40分）",
        "r": "<t>授权（40分）</t>",
        "h": "授权（40分）",
        "w": "授权（40分）"
    };
    data["L9"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B10"] = {
        "t": "s",
        "v": "1. 品牌方（60分）",
        "r": "<t>1. 品牌方（60分）</t>",
        "h": "1. 品牌方（60分）",
        "w": ""
    };
    data["G10"] = {
        "t": "s",
        "v": "1. 可以给授权（40分）",
        "r": "<t>1. 可以给授权（40分）</t>",
        "h": "1. 可以给授权（40分）",
        "w": ""
    };
    data["B11"] = {
        "t": "s",
        "v": "2. 总代（50分）",
        "r": "<t>2. 总代（50分）</t>",
        "h": "2. 总代（50分）",
        "w": ""
    };
    data["G11"] = {
        "t": "s",
        "v": "2. 不可以给授权（0分）",
        "r": "<t>2. 不可以给授权（0分）</t>",
        "h": "2. 不可以给授权（0分）",
        "w": ""
    };
    data["B12"] = {
        "t": "s",
        "v": "3. 代理（40分）",
        "r": "<t>3. 代理（40分）</t>",
        "h": "3. 代理（40分）",
        "w": ""
    };
    data["B13"] = {
        "t": "s",
        "v": "4. 分销商（30分）",
        "r": "<t>4. 分销商（30分）</t>",
        "h": "4. 分销商（30分）",
        "w": ""
    };
    data["B14"] = {
        "t": "s",
        "v": "5. 无资质（0分）",
        "r": "<t>5. 无资质（0分）</t>",
        "h": "5. 无资质（0分）",
        "w": ""
    };
    data["A15"] = {
        "t": "s",
        "v": "协作水平（40%）",
        "r": "<t>协作水平（40%）</t>",
        "h": "协作水平（40%）",
        "w": "协作水平（40%）"
    };
    data["B15"] = {
        "t": "s",
        "v": "价格合理性（40分）",
        "r": "<t>价格合理性（40分）</t>",
        "h": "价格合理性（40分）",
        "w": "价格合理性（40分）"
    };
    data["F15"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["G15"] = {
        "t": "s",
        "v": "账期长短（30分）",
        "r": "<t>账期长短（30分）</t>",
        "h": "账期长短（30分）",
        "w": "账期长短（30分）"
    };
    data["L15"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["M15"] = {
        "t": "s",
        "v": "退货保证（30分）",
        "r": "<t>退货保证（30分）</t>",
        "h": "退货保证（30分）",
        "w": "退货保证（30分）"
    };
    data["P15"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B17"] = {
        "t": "s",
        "v": "1.所有供应商中价格最优（40分）",
        "r": "<t>1.所有供应商中价格最优（40分）</t>",
        "h": "1.所有供应商中价格最优（40分）",
        "w": ""
    };
    data["G17"] = {
        "t": "s",
        "v": "1.月结30天含30天及以上（30分）",
        "r": "<t>1.月结30天含30天及以上（30分）</t>",
        "h": "1.月结30天含30天及以上（30分）",
        "w": ""
    };
    data["M17"] = {
        "t": "s",
        "v": "1.3个月内退货（30分）",
        "r": "<t>1.3个月内退货（30分）</t>",
        "h": "1.3个月内退货（30分）",
        "w": ""
    };
    data["B18"] = {
        "t": "s",
        "v": "2.价格一般（20分）",
        "r": "<t>2.价格一般（20分）</t>",
        "h": "2.价格一般（20分）",
        "w": ""
    };
    data["G18"] = {
        "t": "s",
        "v": "2.半月结15天。（20分）",
        "r": "<t>2.半月结15天。（20分）</t>",
        "h": "2.半月结15天。（20分）",
        "w": ""
    };
    data["M18"] = {
        "t": "s",
        "v": "2.质量问题退货（15分）",
        "r": "<t>2.质量问题退货（15分）</t>",
        "h": "2.质量问题退货（15分）",
        "w": ""
    };
    data["B19"] = {
        "t": "s",
        "v": "3.价格差（0分）",
        "r": "<t>3.价格差（0分）</t>",
        "h": "3.价格差（0分）",
        "w": ""
    };
    data["G19"] = {
        "t": "s",
        "v": "3.货到付款（15分）",
        "r": "<t>3.货到付款（15分）</t>",
        "h": "3.货到付款（15分）",
        "w": ""
    };
    data["M19"] = {
        "t": "s",
        "v": "3.不退货（0分）",
        "r": "<t>3.不退货（0分）</t>",
        "h": "3.不退货（0分）",
        "w": ""
    };
    data["G20"] = {
        "t": "s",
        "v": "4.30%预付款70%见票付款（5分）",
        "r": "<t>4.30%预付款70%见票付款（5分）</t>",
        "h": "4.30%预付款70%见票付款（5分）",
        "w": ""
    };
    data["G21"] = {
        "t": "s",
        "v": "5.50%预付款50%见票付款（3分）",
        "r": "<t>5.50%预付款50%见票付款（3分）</t>",
        "h": "5.50%预付款50%见票付款（3分）",
        "w": ""
    };
    data["G22"] = {
        "t": "s",
        "v": "6.款到发货（0分）",
        "r": "<t>6.款到发货（0分）</t>",
        "h": "6.款到发货（0分）",
        "w": ""
    };
    data["A23"] = {
        "t": "s",
        "v": "物流及交付（15%）",
        "r": "<t>物流及交付（15%）</t>",
        "h": "物流及交付（15%）",
        "w": "物流及交付（15%）"
    };
    data["B23"] = {
        "t": "s",
        "v": "交期（50分）",
        "r": "<t>交期（50分）</t>",
        "h": "交期（50分）",
        "w": "交期（50分）"
    };
    data["F23"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["G23"] = {
        "t": "s",
        "v": "运输方式（20分）",
        "r": "<t>运输方式（20分）</t>",
        "h": "运输方式（20分）",
        "w": "运输方式（20分）"
    };
    data["L23"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["M23"] = {
        "t": "s",
        "v": "紧急订单处理（20分）",
        "r": "<t>紧急订单处理（20分）</t>",
        "h": "紧急订单处理（20分）",
        "w": "紧急订单处理（20分）"
    };
    data["P23"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B25"] = {
        "t": "s",
        "v": "1. 交货非常及时，从未发生过拖延、延 迟的现象（50分）",
        "r": "<t>1. 交货非常及时，从未发生过拖延、延 迟的现象（50分）</t>",
        "h": "1. 交货非常及时，从未发生过拖延、延 迟的现象（50分）",
        "w": "",
        "s": {
            alignment: {vertical: "center", horizontal: "center", wrapText: "true"},
            font: {sz: 10, name: "宋体"}
        }
    };
    data["G25"] = {
        "t": "s",
        "v": "1. 报价是否可以含运费送货到仓库？",
        "r": "<t>1. 报价是否可以含运费送货到仓库？</t>",
        "h": "1. 报价是否可以含运费送货到仓库？",
        "w": ""
    };
    data["M25"] = {
        "t": "s",
        "v": "1. 是否愿意承接公司的紧急订单？",
        "r": "<t>1. 是否愿意承接公司的紧急订单？</t>",
        "h": "1. 是否愿意承接公司的紧急订单？",
        "w": ""
    };
    data["B26"] = {
        "t": "s",
        "v": "2. 交货比较及时，偶尔发生过拖延、延 迟的现象（40分）",
        "r": "<t>2. 交货比较及时，偶尔发生过拖延、延 迟的现象（40分）</t>",
        "h": "2. 交货比较及时，偶尔发生过拖延、延 迟的现象（40分）",
        "w": ""
    };
    data["G26"] = {
        "t": "s",
        "v": "A可以（7分）  B不行（0分）",
        "r": "<t>A可以（7分）  B不行（0分）</t>",
        "h": "A可以（7分）  B不行（0分）",
        "w": ""
    };
    data["M26"] = {
        "t": "s",
        "v": "A愿意（10分）  B不行（0分）",
        "r": "<t>A愿意（10分）  B不行（0分）</t>",
        "h": "A愿意（10分）  B不行（0分）",
        "w": ""
    };
    data["B27"] = {
        "t": "s",
        "v": "3. 交货一般，时有发生过拖延、延迟的 现象（20分）",
        "r": "<t>3. 交货一般，时有发生过拖延、延迟的 现象（20分）</t>",
        "h": "3. 交货一般，时有发生过拖延、延迟的 现象（20分）",
        "w": ""
    };
    data["G27"] = {
        "t": "s",
        "v": "2. 在发运过程中对物品是否有必要保护措施？",
        "r": "<t>2. 在发运过程中对物品是否有必要保护措施？</t>",
        "h": "2. 在发运过程中对物品是否有必要保护措施？",
        "w": ""
    };
    data["M27"] = {
        "t": "s",
        "v": "2. 承接紧急订单效果如何？",
        "r": "<t>2. 承接紧急订单效果如何？</t>",
        "h": "2. 承接紧急订单效果如何？",
        "w": ""
    };
    data["B28"] = {
        "t": "s",
        "v": "4.  交货不及时，经常发生过拖延、延迟 的现象，难以保证供应需要（0分）",
        "r": "<t>4.  交货不及时，经常发生过拖延、延迟 的现象，难以保证供应需要（0分）</t>",
        "h": "4.  交货不及时，经常发生过拖延、延迟 的现象，难以保证供应需要（0分）",
        "w": ""
    };
    data["G28"] = {
        "t": "s",
        "v": "A有（7分）    B没有（0分）",
        "r": "<t>A有（7分）    B没有（0分）</t>",
        "h": "A有（7分）    B没有（0分）",
        "w": ""
    };
    data["M28"] = {
        "t": "s",
        "v": "A基本能满足我方需求（10分） B满足我方需求较低（5分）",
        "r": "<t>A基本能满足我方需求（10分） B满足我方需求较低（5分）</t>",
        "h": "A基本能满足我方需求（10分） B满足我方需求较低（5分）",
        "w": ""
    };
    data["B29"] = {
        "t": "s",
        "v": "*按时交货率=按时交货批数/总进料批数 得分=按时交货率×10",
        "r": "<t>*按时交货率=按时交货批数/总进料批数 得分=按时交货率×10</t>",
        "h": "*按时交货率=按时交货批数/总进料批数 得分=按时交货率×10",
        "w": ""
    };
    data["G29"] = {
        "t": "s",
        "v": "3. 是否存有自身运输机构？",
        "r": "<t>3. 是否存有自身运输机构？</t>",
        "h": "3. 是否存有自身运输机构？",
        "w": ""
    };
    data["G30"] = {
        "t": "s",
        "v": "A有（6分）    B没有（0分）",
        "r": "<t>A有（6分）    B没有（0分）</t>",
        "h": "A有（6分）    B没有（0分）",
        "w": ""
    };
    data["B31"] = {
        "t": "s",
        "v": "预警系统（10分）",
        "r": "<t>预警系统（10分）</t>",
        "h": "预警系统（10分）",
        "w": "预警系统（10分）"
    };
    data["F31"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B32"] = {
        "t": "s",
        "v": "1. 是否有很好的预警措施，以确保在交 货延迟时能及时通知我方作好相关处理？（请举事例具体说明）",
        "r": "<t>1. 是否有很好的预警措施，以确保在交 货延迟时能及时通知我方作好相关处理？（请举事例具体说明）</t>",
        "h": "1. 是否有很好的预警措施，以确保在交 货延迟时能及时通知我方作好相关处理？（请举事例具体说明）",
        "w": ""
    };
    data["B33"] = {
        "t": "s",
        "v": "A可以（10分） B不行（0分）",
        "r": "<t>A可以（10分） B不行（0分）</t>",
        "h": "A可以（10分） B不行（0分）",
        "w": ""
    };
    data["A34"] = {
        "t": "s",
        "v": "店铺推广、活动配合度（10%）",
        "r": "<t>店铺推广、活动配合度（10%）</t>",
        "h": "店铺推广、活动配合度（10%）",
        "w": "店铺推广、活动配合度（10%）"
    };
    data["B34"] = {
        "t": "s",
        "v": "样品提供及时性（10分）",
        "r": "<t>样品提供及时性（10分）</t>",
        "h": "样品提供及时性（10分）",
        "w": "样品提供及时性（10分）"
    };
    data["F34"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["G34"] = {
        "t": "s",
        "v": "对活动推广文案资料完成性（25分）",
        "r": "<t>对活动推广文案资料完成性（25分）</t>",
        "h": "对活动推广文案资料完成性（25分）",
        "w": "对活动推广文案资料完成性（25分）"
    };
    data["L34"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["M34"] = {
        "t": "s",
        "v": "赠品提供(25分)",
        "r": "<t>赠品提供(25分)</t>",
        "h": "赠品提供(25分)",
        "w": "赠品提供(25分)"
    };
    data["P34"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B36"] = {
        "t": "s",
        "v": "1. 可以按要求及时提供样品（10分）",
        "r": "<t>1. 可以按要求及时提供样品（10分）</t>",
        "h": "1. 可以按要求及时提供样品（10分）",
        "w": ""
    };
    data["G36"] = {
        "t": "s",
        "v": "1. 按需求提供质优活动文案（25分）",
        "r": "<t>1. 按需求提供质优活动文案（25分）</t>",
        "h": "1. 按需求提供质优活动文案（25分）",
        "w": ""
    };
    data["M36"] = {
        "t": "s",
        "v": "1. 配合活动提供赠品（25分）",
        "r": "<t>1. 配合活动提供赠品（25分）</t>",
        "h": "1. 配合活动提供赠品（25分）",
        "w": ""
    };
    data["B37"] = {
        "t": "s",
        "v": "2. 可以提供样品，时间不及时（5分）",
        "r": "<t>2. 可以提供样品，时间不及时（5分）</t>",
        "h": "2. 可以提供样品，时间不及时（5分）",
        "w": ""
    };
    data["G37"] = {
        "t": "s",
        "v": "2. 无文案提供（0分）",
        "r": "<t>2. 无文案提供（0分）</t>",
        "h": "2. 无文案提供（0分）",
        "w": ""
    };
    data["M37"] = {
        "t": "s",
        "v": "2. 提供少量赠品（10分）",
        "r": "<t>2. 提供少量赠品（10分）</t>",
        "h": "2. 提供少量赠品（10分）",
        "w": ""
    };
    data["B38"] = {
        "t": "s",
        "v": "3. 不提供样品（0分）",
        "r": "<t>3. 不提供样品（0分）</t>",
        "h": "3. 不提供样品（0分）",
        "w": ""
    };
    data["M38"] = {
        "t": "s",
        "v": "3. 无赠品提供（0分）",
        "r": "<t>3. 无赠品提供（0分）</t>",
        "h": "3. 无赠品提供（0分）",
        "w": ""
    };
    data["B39"] = {
        "t": "s",
        "v": "  ",
        "r": "<t>  </t>",
        "h": "  ",
        "w": "  "
    };
    data["B40"] = {
        "t": "s",
        "v": "售后相关处理 (40分)",
        "r": "<t>售后相关处理 (40分)</t>",
        "h": "售后相关处理 (40分)",
        "w": "售后相关处理 (40分)"
    };
    data["F40"] = {
        "t": "s",
        "v": "选项",
        "r": "<t>选项</t>",
        "h": "选项",
        "w": "选项"
    };
    data["B41"] = {
        "t": "s",
        "v": "1. 针对质量问题提供授权和其他凭证或者开账户订货，并配合退换货（15分）",
        "r": "1. 针对质量问题提供授权和其他凭证或者开账户订货，并配合退换货（15分）",
        "h": "1. 针对质量问题提供授权和其他凭证或者开账户订货，并配合退换货（15分）",
        "w": ""
    };
    data["B42"] = {
        "t": "s",
        "v": "2. 三一五工商投诉需要供应商举证；网路上的博主扒皮拔草贴要配合解释，出现假货或者疑似假货配合举证（15分）",
        "r": "<t>2. 三一五工商投诉需要供应商举证；网路上的博主扒皮拔草贴要配合解释，出现假货或者疑似假货配合举证（15分）</t>",
        "h": "2. 三一五工商投诉需要供应商举证；网路上的博主扒皮拔草贴要配合解释，出现假货或者疑似假货配合举证（15分）",
        "w": ""
    };
    data["B43"] = {
        "t": "s",
        "v": "3. 交货后，版本，印刷，包装变化配合解释和官方说明（10分）",
        "r": "3. 交货后，版本，印刷，包装变化配合解释和官方说明（10分）",
        "h": "3. 交货后，版本，印刷，包装变化配合解释和官方说明（10分）",
        "w": ""
    };
    data["A44"] = {
        "t": "s",
        "v": "供应商评分总计",
        "r": "<t>供应商评分总计</t>",
        "h": "供应商评分总计",
        "w": "供应商评分总计"
    };
    data["D44"] = {
        "t": "e",
        "v": 23,
        "f": "0.05*(F6+L6)+0.3*(F10+L10)+0.4*(F17+L17+P17)+0.15*(F25+#REF!+#REF!+F32)+0.1*(F36+L36+P36+F41)",
        "w": "#REF!"
    };
    data["I44"] = {
        "t": "s",
        "v": "供应商等级 ",
        "r": "<t>供应商等级 </t>",
        "h": "供应商等级 ",
        "w": "供应商等级 "
    };
    data["A46"] = {
        "t": "s",
        "v": " ",
        "r": "<t> </t>",
        "h": " ",
        "w": " "
    };
    data["K46"] = {
        "t": "s",
        "v": "供应商评分 ",
        "r": "<t>供应商评分 </t>",
        "h": "供应商评分 ",
        "w": "供应商评分 "
    };
    data["L46"] = {
        "t": "s",
        "v": "≥85分 ",
        "r": "<t>≥85分 </t>",
        "h": "≥85分 ",
        "w": "≥85分 "
    };
    data["M46"] = {
        "t": "s",
        "v": "≥75分",
        "r": "<t>≥75分</t>",
        "h": "≥75分",
        "w": "≥75分"
    };
    data["N46"] = {
        "t": "s",
        "v": " ≥65分 ",
        "r": "<t> ≥65分 </t>",
        "h": " ≥65分 ",
        "w": " ≥65分 "
    };
    data["O46"] = {
        "t": "s",
        "v": "＜45分",
        "r": "<t>＜45分</t>",
        "h": "＜45分",
        "w": "＜45分"
    };
    data["K47"] = {
        "t": "s",
        "v": "供应商等级",
        "r": "<t>供应商等级</t>",
        "h": "供应商等级",
        "w": "供应商等级"
    };
    data["L47"] = {
        "t": "s",
        "v": " A ",
        "r": "<t> A </t>",
        "h": " A ",
        "w": " A "
    };
    data["M47"] = {
        "t": "s",
        "v": "B ",
        "r": "<t>B </t>",
        "h": "B ",
        "w": "B "
    };
    data["N47"] = {
        "t": "s",
        "v": " C",
        "r": "<t> C</t>",
        "h": " C",
        "w": " C"
    };
    data["O47"] = {
        "t": "s",
        "v": "D",
        "r": "<t>D</t>",
        "h": "D",
        "w": "D"
    };
    data["K48"] = {
        "t": "s",
        "v": "含义",
        "r": "<t>含义</t>",
        "h": "含义",
        "w": "含义"
    };
    data["L48"] = {
        "t": "s",
        "v": " 策略性供应商    ",
        "r": "<t> 策略性供应商    </t>",
        "h": " 策略性供应商    ",
        "w": " 策略性供应商    "
    };
    data["M48"] = {
        "t": "s",
        "v": "优质供应商 ",
        "r": "<t>优质供应商 </t>",
        "h": "优质供应商 ",
        "w": "优质供应商 "
    };
    data["N48"] = {
        "t": "s",
        "v": "良好供应商 ",
        "r": "<t>良好供应商 </t>",
        "h": "良好供应商 ",
        "w": "良好供应商 "
    };
    data["O48"] = {
        "t": "s",
        "v": "淘汰供应商",
        "r": "<t>淘汰供应商</t>",
        "h": "淘汰供应商",
        "w": "淘汰供应商"
    };
    data["K49"] = {
        "t": "s",
        "v": "措施 ",
        "r": "<t>措施 </t>",
        "h": "措施 ",
        "w": "措施 "
    };
    data["L49"] = {
        "t": "s",
        "v": " 列入《合格供应商目录》",
        "r": "<t> 列入《合格供应商目录》</t>",
        "h": " 列入《合格供应商目录》",
        "w": " 列入《合格供应商目录》"
    };
    data["M49"] = {
        "t": "s",
        "v": " 列入《合格供应商目录》  ",
        "r": "<t> 列入《合格供应商目录》  </t>",
        "h": " 列入《合格供应商目录》  ",
        "w": " 列入《合格供应商目录》  "
    };
    data["N49"] = {
        "t": "s",
        "v": "列入《合格供应商目录》",
        "r": "<t>列入《合格供应商目录》</t>",
        "h": "列入《合格供应商目录》",
        "w": "列入《合格供应商目录》"
    };
    data["O49"] = {
        "t": "s",
        "v": "取消供应商资格，选择新的供应商",
        "r": "<t>取消供应商资格，选择新的供应商</t>",
        "h": "取消供应商资格，选择新的供应商",
        "w": "取消供应商资格，选择新的供应商"
    };

    data["!ref"] = "A1:IV49";

    //合并数据
    data["!merges"] = [
        {
            "s": {
                "c": 15,
                "r": 24
            },
            "e": {
                "c": 15,
                "r": 27
            }
        },
        {
            "s": {
                "c": 11,
                "r": 24
            },
            "e": {
                "c": 11,
                "r": 29
            }
        },
        {
            "s": {
                "c": 0,
                "r": 0
            },
            "e": {
                "c": 15,
                "r": 0
            }
        },
        {
            "s": {
                "c": 12,
                "r": 9
            },
            "e": {
                "c": 14,
                "r": 13
            }
        },
        {
            "s": {
                "c": 0,
                "r": 1
            },
            "e": {
                "c": 1,
                "r": 1
            }
        },
        {
            "s": {
                "c": 2,
                "r": 1
            },
            "e": {
                "c": 3,
                "r": 1
            }
        },
        {
            "s": {
                "c": 4,
                "r": 1
            },
            "e": {
                "c": 6,
                "r": 1
            }
        },
        {
            "s": {
                "c": 7,
                "r": 1
            },
            "e": {
                "c": 8,
                "r": 1
            }
        },
        {
            "s": {
                "c": 9,
                "r": 1
            },
            "e": {
                "c": 11,
                "r": 1
            }
        },
        {
            "s": {
                "c": 14,
                "r": 1
            },
            "e": {
                "c": 15,
                "r": 1
            }
        },
        {
            "s": {
                "c": 0,
                "r": 2
            },
            "e": {
                "c": 1,
                "r": 2
            }
        },
        {
            "s": {
                "c": 2,
                "r": 2
            },
            "e": {
                "c": 3,
                "r": 2
            }
        },
        {
            "s": {
                "c": 6,
                "r": 5
            },
            "e": {
                "c": 10,
                "r": 7
            }
        },
        {
            "s": {
                "c": 4,
                "r": 2
            },
            "e": {
                "c": 6,
                "r": 2
            }
        },
        {
            "s": {
                "c": 12,
                "r": 8
            },
            "e": {
                "c": 14,
                "r": 8
            }
        },
        {
            "s": {
                "c": 7,
                "r": 2
            },
            "e": {
                "c": 8,
                "r": 2
            }
        },
        {
            "s": {
                "c": 11,
                "r": 5
            },
            "e": {
                "c": 11,
                "r": 7
            }
        },
        {
            "s": {
                "c": 9,
                "r": 2
            },
            "e": {
                "c": 11,
                "r": 2
            }
        },
        {
            "s": {
                "c": 14,
                "r": 2
            },
            "e": {
                "c": 15,
                "r": 2
            }
        },
        {
            "s": {
                "c": 1,
                "r": 5
            },
            "e": {
                "c": 4,
                "r": 5
            }
        },
        {
            "s": {
                "c": 1,
                "r": 6
            },
            "e": {
                "c": 4,
                "r": 6
            }
        },
        {
            "s": {
                "c": 5,
                "r": 9
            },
            "e": {
                "c": 5,
                "r": 13
            }
        },
        {
            "s": {
                "c": 1,
                "r": 7
            },
            "e": {
                "c": 4,
                "r": 7
            }
        },
        {
            "s": {
                "c": 1,
                "r": 8
            },
            "e": {
                "c": 4,
                "r": 8
            }
        },
        {
            "s": {
                "c": 6,
                "r": 8
            },
            "e": {
                "c": 10,
                "r": 8
            }
        },
        {
            "s": {
                "c": 1,
                "r": 9
            },
            "e": {
                "c": 4,
                "r": 9
            }
        },
        {
            "s": {
                "c": 6,
                "r": 13
            },
            "e": {
                "c": 10,
                "r": 13
            }
        },
        {
            "s": {
                "c": 1,
                "r": 16
            },
            "e": {
                "c": 4,
                "r": 16
            }
        },
        {
            "s": {
                "c": 6,
                "r": 16
            },
            "e": {
                "c": 10,
                "r": 16
            }
        },
        {
            "s": {
                "c": 12,
                "r": 16
            },
            "e": {
                "c": 14,
                "r": 16
            }
        },
        {
            "s": {
                "c": 1,
                "r": 17
            },
            "e": {
                "c": 4,
                "r": 17
            }
        },
        {
            "s": {
                "c": 6,
                "r": 17
            },
            "e": {
                "c": 10,
                "r": 17
            }
        },
        {
            "s": {
                "c": 12,
                "r": 17
            },
            "e": {
                "c": 14,
                "r": 17
            }
        },
        {
            "s": {
                "c": 0,
                "r": 8
            },
            "e": {
                "c": 0,
                "r": 13
            }
        },
        {
            "s": {
                "c": 1,
                "r": 18
            },
            "e": {
                "c": 4,
                "r": 18
            }
        },
        {
            "s": {
                "c": 6,
                "r": 18
            },
            "e": {
                "c": 10,
                "r": 18
            }
        },
        {
            "s": {
                "c": 12,
                "r": 18
            },
            "e": {
                "c": 14,
                "r": 18
            }
        },
        {
            "s": {
                "c": 6,
                "r": 9
            },
            "e": {
                "c": 10,
                "r": 9
            }
        },
        {
            "s": {
                "c": 1,
                "r": 10
            },
            "e": {
                "c": 4,
                "r": 10
            }
        },
        {
            "s": {
                "c": 6,
                "r": 10
            },
            "e": {
                "c": 10,
                "r": 10
            }
        },
        {
            "s": {
                "c": 1,
                "r": 11
            },
            "e": {
                "c": 4,
                "r": 11
            }
        },
        {
            "s": {
                "c": 5,
                "r": 14
            },
            "e": {
                "c": 5,
                "r": 15
            }
        },
        {
            "s": {
                "c": 6,
                "r": 11
            },
            "e": {
                "c": 10,
                "r": 11
            }
        },
        {
            "s": {
                "c": 1,
                "r": 12
            },
            "e": {
                "c": 4,
                "r": 12
            }
        },
        {
            "s": {
                "c": 6,
                "r": 12
            },
            "e": {
                "c": 10,
                "r": 12
            }
        },
        {
            "s": {
                "c": 1,
                "r": 13
            },
            "e": {
                "c": 4,
                "r": 13
            }
        },
        {
            "s": {
                "c": 5,
                "r": 22
            },
            "e": {
                "c": 5,
                "r": 23
            }
        },
        {
            "s": {
                "c": 6,
                "r": 19
            },
            "e": {
                "c": 10,
                "r": 19
            }
        },
        {
            "s": {
                "c": 1,
                "r": 20
            },
            "e": {
                "c": 4,
                "r": 20
            }
        },
        {
            "s": {
                "c": 6,
                "r": 20
            },
            "e": {
                "c": 10,
                "r": 20
            }
        },
        {
            "s": {
                "c": 1,
                "r": 21
            },
            "e": {
                "c": 4,
                "r": 21
            }
        },
        {
            "s": {
                "c": 5,
                "r": 24
            },
            "e": {
                "c": 5,
                "r": 29
            }
        },
        {
            "s": {
                "c": 6,
                "r": 21
            },
            "e": {
                "c": 10,
                "r": 21
            }
        },
        {
            "s": {
                "c": 12,
                "r": 21
            },
            "e": {
                "c": 14,
                "r": 21
            }
        },
        {
            "s": {
                "c": 1,
                "r": 24
            },
            "e": {
                "c": 4,
                "r": 24
            }
        },
        {
            "s": {
                "c": 6,
                "r": 24
            },
            "e": {
                "c": 10,
                "r": 24
            }
        },
        {
            "s": {
                "c": 12,
                "r": 24
            },
            "e": {
                "c": 14,
                "r": 24
            }
        },
        {
            "s": {
                "c": 1,
                "r": 25
            },
            "e": {
                "c": 4,
                "r": 25
            }
        },
        {
            "s": {
                "c": 6,
                "r": 25
            },
            "e": {
                "c": 10,
                "r": 25
            }
        },
        {
            "s": {
                "c": 12,
                "r": 25
            },
            "e": {
                "c": 14,
                "r": 25
            }
        },
        {
            "s": {
                "c": 1,
                "r": 26
            },
            "e": {
                "c": 4,
                "r": 26
            }
        },
        {
            "s": {
                "c": 6,
                "r": 26
            },
            "e": {
                "c": 10,
                "r": 26
            }
        },
        {
            "s": {
                "c": 12,
                "r": 26
            },
            "e": {
                "c": 14,
                "r": 26
            }
        },
        {
            "s": {
                "c": 1,
                "r": 27
            },
            "e": {
                "c": 4,
                "r": 27
            }
        },
        {
            "s": {
                "c": 6,
                "r": 27
            },
            "e": {
                "c": 10,
                "r": 27
            }
        },
        {
            "s": {
                "c": 12,
                "r": 27
            },
            "e": {
                "c": 14,
                "r": 27
            }
        },
        {
            "s": {
                "c": 1,
                "r": 28
            },
            "e": {
                "c": 4,
                "r": 28
            }
        },
        {
            "s": {
                "c": 5,
                "r": 16
            },
            "e": {
                "c": 5,
                "r": 21
            }
        },
        {
            "s": {
                "c": 1,
                "r": 19
            },
            "e": {
                "c": 4,
                "r": 19
            }
        },
        {
            "s": {
                "c": 5,
                "r": 31
            },
            "e": {
                "c": 5,
                "r": 32
            }
        },
        {
            "s": {
                "c": 6,
                "r": 28
            },
            "e": {
                "c": 10,
                "r": 28
            }
        },
        {
            "s": {
                "c": 12,
                "r": 28
            },
            "e": {
                "c": 14,
                "r": 28
            }
        },
        {
            "s": {
                "c": 1,
                "r": 29
            },
            "e": {
                "c": 4,
                "r": 29
            }
        },
        {
            "s": {
                "c": 6,
                "r": 29
            },
            "e": {
                "c": 10,
                "r": 29
            }
        },
        {
            "s": {
                "c": 12,
                "r": 29
            },
            "e": {
                "c": 14,
                "r": 29
            }
        },
        {
            "s": {
                "c": 1,
                "r": 30
            },
            "e": {
                "c": 4,
                "r": 30
            }
        },
        {
            "s": {
                "c": 5,
                "r": 33
            },
            "e": {
                "c": 5,
                "r": 34
            }
        },
        {
            "s": {
                "c": 6,
                "r": 30
            },
            "e": {
                "c": 10,
                "r": 30
            }
        },
        {
            "s": {
                "c": 12,
                "r": 30
            },
            "e": {
                "c": 14,
                "r": 30
            }
        },
        {
            "s": {
                "c": 1,
                "r": 31
            },
            "e": {
                "c": 4,
                "r": 31
            }
        },
        {
            "s": {
                "c": 1,
                "r": 32
            },
            "e": {
                "c": 4,
                "r": 32
            }
        },
        {
            "s": {
                "c": 11,
                "r": 35
            },
            "e": {
                "c": 11,
                "r": 38
            }
        },
        {
            "s": {
                "c": 11,
                "r": 40
            },
            "e": {
                "c": 11,
                "r": 42
            }
        },
        {
            "s": {
                "c": 5,
                "r": 35
            },
            "e": {
                "c": 5,
                "r": 38
            }
        },
        {
            "s": {
                "c": 1,
                "r": 35
            },
            "e": {
                "c": 4,
                "r": 35
            }
        },
        {
            "s": {
                "c": 6,
                "r": 35
            },
            "e": {
                "c": 10,
                "r": 35
            }
        },
        {
            "s": {
                "c": 12,
                "r": 35
            },
            "e": {
                "c": 14,
                "r": 35
            }
        },
        {
            "s": {
                "c": 1,
                "r": 36
            },
            "e": {
                "c": 4,
                "r": 36
            }
        },
        {
            "s": {
                "c": 6,
                "r": 36
            },
            "e": {
                "c": 10,
                "r": 36
            }
        },
        {
            "s": {
                "c": 12,
                "r": 36
            },
            "e": {
                "c": 14,
                "r": 36
            }
        },
        {
            "s": {
                "c": 1,
                "r": 37
            },
            "e": {
                "c": 4,
                "r": 37
            }
        },
        {
            "s": {
                "c": 5,
                "r": 40
            },
            "e": {
                "c": 5,
                "r": 42
            }
        },
        {
            "s": {
                "c": 6,
                "r": 37
            },
            "e": {
                "c": 10,
                "r": 37
            }
        },
        {
            "s": {
                "c": 12,
                "r": 37
            },
            "e": {
                "c": 14,
                "r": 37
            }
        },
        {
            "s": {
                "c": 1,
                "r": 38
            },
            "e": {
                "c": 4,
                "r": 38
            }
        },
        {
            "s": {
                "c": 6,
                "r": 38
            },
            "e": {
                "c": 10,
                "r": 38
            }
        },
        {
            "s": {
                "c": 12,
                "r": 38
            },
            "e": {
                "c": 14,
                "r": 38
            }
        },
        {
            "s": {
                "c": 1,
                "r": 39
            },
            "e": {
                "c": 4,
                "r": 39
            }
        },
        {
            "s": {
                "c": 6,
                "r": 39
            },
            "e": {
                "c": 10,
                "r": 39
            }
        },
        {
            "s": {
                "c": 12,
                "r": 39
            },
            "e": {
                "c": 14,
                "r": 39
            }
        },
        {
            "s": {
                "c": 1,
                "r": 40
            },
            "e": {
                "c": 4,
                "r": 40
            }
        },
        {
            "s": {
                "c": 1,
                "r": 41
            },
            "e": {
                "c": 4,
                "r": 41
            }
        },
        {
            "s": {
                "c": 1,
                "r": 42
            },
            "e": {
                "c": 4,
                "r": 42
            }
        },
        {
            "s": {
                "c": 15,
                "r": 33
            },
            "e": {
                "c": 15,
                "r": 34
            }
        },
        {
            "s": {
                "c": 15,
                "r": 35
            },
            "e": {
                "c": 15,
                "r": 38
            }
        },
        {
            "s": {
                "c": 0,
                "r": 43
            },
            "e": {
                "c": 2,
                "r": 43
            }
        },
        {
            "s": {
                "c": 11,
                "r": 3
            },
            "e": {
                "c": 11,
                "r": 4
            }
        },
        {
            "s": {
                "c": 3,
                "r": 43
            },
            "e": {
                "c": 7,
                "r": 43
            }
        },
        {
            "s": {
                "c": 8,
                "r": 43
            },
            "e": {
                "c": 9,
                "r": 43
            }
        },
        {
            "s": {
                "c": 10,
                "r": 43
            },
            "e": {
                "c": 15,
                "r": 43
            }
        },
        {
            "s": {
                "c": 6,
                "r": 40
            },
            "e": {
                "c": 10,
                "r": 42
            }
        },
        {
            "s": {
                "c": 0,
                "r": 3
            },
            "e": {
                "c": 0,
                "r": 4
            }
        },
        {
            "s": {
                "c": 0,
                "r": 5
            },
            "e": {
                "c": 0,
                "r": 7
            }
        },
        {
            "s": {
                "c": 12,
                "r": 14
            },
            "e": {
                "c": 14,
                "r": 15
            }
        },
        {
            "s": {
                "c": 0,
                "r": 14
            },
            "e": {
                "c": 0,
                "r": 21
            }
        },
        {
            "s": {
                "c": 0,
                "r": 22
            },
            "e": {
                "c": 0,
                "r": 32
            }
        },
        {
            "s": {
                "c": 12,
                "r": 31
            },
            "e": {
                "c": 14,
                "r": 32
            }
        },
        {
            "s": {
                "c": 0,
                "r": 33
            },
            "e": {
                "c": 0,
                "r": 42
            }
        },
        {
            "s": {
                "c": 5,
                "r": 3
            },
            "e": {
                "c": 5,
                "r": 4
            }
        },
        {
            "s": {
                "c": 5,
                "r": 5
            },
            "e": {
                "c": 5,
                "r": 7
            }
        },
        {
            "s": {
                "c": 11,
                "r": 9
            },
            "e": {
                "c": 11,
                "r": 13
            }
        },
        {
            "s": {
                "c": 11,
                "r": 14
            },
            "e": {
                "c": 11,
                "r": 15
            }
        },
        {
            "s": {
                "c": 11,
                "r": 16
            },
            "e": {
                "c": 11,
                "r": 21
            }
        },
        {
            "s": {
                "c": 11,
                "r": 22
            },
            "e": {
                "c": 11,
                "r": 23
            }
        },
        {
            "s": {
                "c": 11,
                "r": 31
            },
            "e": {
                "c": 11,
                "r": 32
            }
        },
        {
            "s": {
                "c": 11,
                "r": 33
            },
            "e": {
                "c": 11,
                "r": 34
            }
        },
        {
            "s": {
                "c": 15,
                "r": 40
            },
            "e": {
                "c": 15,
                "r": 42
            }
        },
        {
            "s": {
                "c": 1,
                "r": 3
            },
            "e": {
                "c": 4,
                "r": 4
            }
        },
        {
            "s": {
                "c": 6,
                "r": 3
            },
            "e": {
                "c": 10,
                "r": 4
            }
        },
        {
            "s": {
                "c": 12,
                "r": 3
            },
            "e": {
                "c": 14,
                "r": 4
            }
        },
        {
            "s": {
                "c": 12,
                "r": 5
            },
            "e": {
                "c": 14,
                "r": 7
            }
        },
        {
            "s": {
                "c": 1,
                "r": 14
            },
            "e": {
                "c": 4,
                "r": 15
            }
        },
        {
            "s": {
                "c": 6,
                "r": 14
            },
            "e": {
                "c": 10,
                "r": 15
            }
        },
        {
            "s": {
                "c": 1,
                "r": 22
            },
            "e": {
                "c": 4,
                "r": 23
            }
        },
        {
            "s": {
                "c": 6,
                "r": 22
            },
            "e": {
                "c": 10,
                "r": 23
            }
        },
        {
            "s": {
                "c": 12,
                "r": 22
            },
            "e": {
                "c": 14,
                "r": 23
            }
        },
        {
            "s": {
                "c": 6,
                "r": 31
            },
            "e": {
                "c": 10,
                "r": 32
            }
        },
        {
            "s": {
                "c": 1,
                "r": 33
            },
            "e": {
                "c": 4,
                "r": 34
            }
        },
        {
            "s": {
                "c": 6,
                "r": 33
            },
            "e": {
                "c": 10,
                "r": 34
            }
        },
        {
            "s": {
                "c": 12,
                "r": 33
            },
            "e": {
                "c": 14,
                "r": 34
            }
        },
        {
            "s": {
                "c": 12,
                "r": 40
            },
            "e": {
                "c": 14,
                "r": 42
            }
        },
        {
            "s": {
                "c": 12,
                "r": 20
            },
            "e": {
                "c": 14,
                "r": 20
            }
        },
        {
            "s": {
                "c": 12,
                "r": 19
            },
            "e": {
                "c": 14,
                "r": 19
            }
        },
        {
            "s": {
                "c": 15,
                "r": 5
            },
            "e": {
                "c": 15,
                "r": 7
            }
        },
        {
            "s": {
                "c": 15,
                "r": 9
            },
            "e": {
                "c": 15,
                "r": 13
            }
        },
        {
            "s": {
                "c": 15,
                "r": 14
            },
            "e": {
                "c": 15,
                "r": 15
            }
        },
        {
            "s": {
                "c": 15,
                "r": 16
            },
            "e": {
                "c": 15,
                "r": 21
            }
        },
        {
            "s": {
                "c": 15,
                "r": 22
            },
            "e": {
                "c": 15,
                "r": 23
            }
        },
        {
            "s": {
                "c": 15,
                "r": 31
            },
            "e": {
                "c": 15,
                "r": 32
            }
        }
    ];
    return data;
}

//excel内容
function content(data, list) {
    data["C2"] = {
        "t": "s",
        "v": list.name,
        "r": list.name,
        "h": list.name,
        "w": ""
    };

    data["H2"] = {
        "t": "s",
        "v": list.legalPerson,
        "r": list.legalPerson,
        "h": list.legalPerson,
        "w": ""
    };
    data["M2"] = {
        "t": "s",
        "v": list.address,
        "r": list.address,
        "h": list.address,
        "w": ""
    };
    data["O2"] = {
        "t": "s",
        "v": list.phone,
        "r": list.phone,
        "h": list.phone,
        "w": ""
    };
    data["C3"] = {
        "t": "s",
        "v": list.productName,
        "r": list.productName,
        "h": list.productName,
        "w": ""
    };
    data["H3"] = {
        "t": "s",
        "v": list.productType,
        "r": list.productType,
        "h": list.productType,
        "w": ""
    };
    data["M3"] = {
        "t": "s",
        "v": list.period,
        "r": list.period,
        "h": list.period,
        "w": ""
    };
    data["O3"] = {
        "t": "s",
        "v": list.old,
        "r": list.old,
        "h": list.old,
        "w": ""
    };

    var caseItem = list.form.situation.case.toString();
    data["F6"] = {
        "t": "s",
        "v": caseItem,
        "r": caseItem,
        "h": caseItem,
        "w": ""
    };

    data["F10"] = {
        "t": "s",
        "v": list.form.brand.brandType.toString(),
        "r": list.form.brand.brandType.toString(),
        "h": list.form.brand.brandType.toString(),
        "w": ""
    };

    data["L10"] = {
        "t": "s",
        "v": list.form.brand.authorization.toString(),
        "r": list.form.brand.authorization.toString(),
        "h": list.form.brand.authorization.toString(),
        "w": ""
    };

    data["F17"] = {
        "t": "s",
        "v": list.form.coordination.rational.toString(),
        "r": list.form.coordination.rational.toString(),
        "h": list.form.coordination.rational.toString(),
        "w": ""
    };

    data["L17"] = {
        "t": "s",
        "v": list.form.coordination.paymentDays.toString(),
        "r": list.form.coordination.paymentDays.toString(),
        "h": list.form.coordination.paymentDays.toString(),
        "w": ""
    };

    data["P17"] = {
        "t": "s",
        "v": list.form.coordination.returnPolicy.toString(),
        "r": list.form.coordination.returnPolicy.toString(),
        "h": list.form.coordination.returnPolicy.toString(),
        "w": ""
    };

    data["F25"] = {
        "t": "s",
        "v": list.form.logistics.deliveryTime.toString(),
        "r": list.form.logistics.deliveryTime.toString(),
        "h": list.form.logistics.deliveryTime.toString(),
        "w": ""
    };

    var transportMode = [];
    $.each(list.form.logistics.transportMode, function (i) {
        transportMode.push(this.split('')[1]);
    });
    data["L25"] = {
        "t": "s",
        "v": transportMode.toString(),
        "r": transportMode.toString(),
        "h": transportMode.toString(),
        "w": ""
    };

    data["P25"] = {
        "t": "s",
        "v": list.form.logistics.needRushOrder.toString() + ',' + list.form.logistics.rushOrderRatio.toString(),
        "r": list.form.logistics.needRushOrder.toString() + ',' + list.form.logistics.rushOrderRatio.toString(),
        "h": list.form.logistics.needRushOrder.toString() + ',' + list.form.logistics.rushOrderRatio.toString(),
        "w": ""
    };

    data["F32"] = {
        "t": "s",
        "v": list.form.logistics.preWarningSystem.toString(),
        "r": list.form.logistics.preWarningSystem.toString(),
        "h": list.form.logistics.preWarningSystem.toString(),
        "w": ""
    };

    data["F36"] = {
        "t": "s",
        "v": list.form.compatibility.timeliness.toString(),
        "r": list.form.compatibility.timeliness.toString(),
        "h": list.form.compatibility.timeliness.toString(),
        "w": ""
    };

    data["L36"] = {
        "t": "s",
        "v": list.form.compatibility.supplyRatio.toString(),
        "r": list.form.compatibility.supplyRatio.toString(),
        "h": list.form.compatibility.supplyRatio.toString(),
        "w": ""
    };

    data["P36"] = {
        "t": "s",
        "v": list.form.compatibility.giftSupply.toString(),
        "r": list.form.compatibility.giftSupply.toString(),
        "h": list.form.compatibility.giftSupply.toString(),
        "w": ""
    };

    var afterSale = list.form.compatibility.afterSale.toString();
    data["F41"] = {
        "t": "s",
        "v": afterSale,
        "r": afterSale,
        "h": afterSale,
        "w": ""
    };

    data["D44"] = {
        "t": "s",
        "v": list.totalScore,
        "r": list.totalScore,
        "h": list.totalScore,
        "w": ""
    };

    data["K44"] = {
        "t": "s",
        "v": list.totalGrade,
        "r": list.totalGrade,
        "h": list.totalGrade,
        "w": ""
    };

    return data;
}

function saveAs(obj, fileName) {//当然可以自定义简单的下载文件实现方式
    var tmpa = document.createElement("a");
    tmpa.download = fileName || "下载";
    tmpa.href = URL.createObjectURL(obj); //绑定a标签
    tmpa.click(); //模拟点击实现下载
    setTimeout(function () { //延时释放
        URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
    }, 100);
}

function s2ab(s) {
    if (typeof ArrayBuffer !== 'undefined') {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    } else {
        var buf = new Array(s.length);
        for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
}




