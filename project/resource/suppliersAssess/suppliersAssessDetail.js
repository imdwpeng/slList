/**
 * Created by dwp on 2017/11/10.
 */

$(document).ready(function () {

    var idx = window.location.search.substring(1).split('=')[1];

    $.ajax({
        type: 'GET',
        url: '/shili/json/assessmentForms.json'
    }).done(function (data) {

        var list = {};
        $.each(data.list, function (i) {
            if (this.id != idx) return;
            list = data.list[i];
            $('#totalScore').text(list.totalScore);
            $('#totalGrade').text(list.totalGrade);
        });

        var html = Mustache.render($('#J_template').html(), list);
        $('.bd').append(html);

        noToName();
    });
});

function noToName() {
    $.ajax({
        type: 'GET',
        url: '/shili/json/noToName.json'
    }).done(function (data) {
        $('fieldset:not(".basic-msg")').each(function () {
            var $this = $(this),
                item = $this.data('item');

            $this.find('.selectedName').each(function () {
                var _this = $(this),
                    type = _this.data('type'),
                    no = _this.data('no');

                _this.text(data[item][type][no]);

                //多选
                if (no && _this.hasClass('multipleChoice')) {
                    var noAttr = no.split(','),
                        name = '';
                    $.each(noAttr, function () {
                        name += '<p class="margin-t-0">' + data[item][type][this] + '</p>';
                    });
                    _this.html(name);

                }
            });
        });

        if ($('#totalField').data('type') == 1) {
            $('#totalSituation').removeClass('hidden');
        }
    });
}
