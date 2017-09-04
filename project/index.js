/**
 * Created by dwp on 17/9/4.
 */

$(document).ready(function () {

    $('#J_menu li').on('click', function () {
        var $this = $(this),
            href = $this.data('href');

        $this.addClass('active').siblings().removeClass('active');
        $('#J_iframeContent').prop('src', href);
    });
});