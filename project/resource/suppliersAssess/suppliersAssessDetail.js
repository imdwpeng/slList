/**
 * Created by dwp on 2017/11/10.
 */

$(document).ready(function () {

    var idx = window.location.search.substring(1).split('=')[1];

    $.ajax({
        type: 'GET',
        url: '../../resource/suppliersAssess/assessmentForms.json'
        // url: '/shili/json/assessmentForms.json'
    }).done(function (data) {

        var list = {},
            updateRecordList = [];
        $.each(data.list, function (i) {
            if (this.id != idx) return;
            list = data.list[i];
            updateRecordList = list.updateRecordList;
            $('#totalScore').text(list.totalScore);
            $('#totalGrade').text(list.totalGrade);
        });

        //详情
        var htmlDetail = Mustache.render($('#J_template').html(), list);
        $('#detailBox').empty().append(htmlDetail);

        var historyList = [];
        $.each(updateRecordList, function (k, v) {

        });

        //修改历史
        var htmlHistory = Mustache.render($('#J_tempHistory').html(), {list: updateRecordList});
        $('#historyBox').empty().append(htmlHistory);

        noToName();
    });
});

function noToName() {
    $.ajax({
        type: 'GET',
        url: '../../resource/suppliersAssess/noToName.json'
        // url: '/shili/json/noToName.json'
    }).done(function (data) {
        $('fieldset:not(".basic-msg")').each(function () {
            var $this = $(this),
                item = $this.data('item');

            $this.find('.selectedName').each(function () {
                var _this = $(this),
                    type = _this.data('type'),
                    no = _this.data('no');

                _this.text(data.optionName[item][type][no]);

                //多选
                if (no && _this.hasClass('multipleChoice')) {
                    var noAttr = no.split(','),
                        name = '';
                    $.each(noAttr, function () {
                        name += '<p class="margin-t-0">' + data.optionName[item][type][this] + '</p>';
                    });
                    _this.html(name);

                }
            });

            //历史纪录
            $('.historyBox').each(function () {
                var _this = $(this),
                    $itemName = _this.find('.itemName'),
                    $optionName = _this.find('.optionName'),
                    nameAttr = $itemName.data('name').split('.'),
                    name = nameAttr.length == 2 ? data.itemName[nameAttr[0]][nameAttr[1]] : data.itemName[nameAttr[0]];

                $itemName.text(name);

            });
        });

        if ($('#totalField').data('type') == 1) {
            $('#totalSituation').removeClass('hidden');
        }
    });
}
