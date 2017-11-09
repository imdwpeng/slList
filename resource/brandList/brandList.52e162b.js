function init(){$.ajax({type:"GET",url:"../../resource/brandList/brandList.json"}).done(function(e){if(e&&e.success){var t=[],i=[],n=[],a='<option value="-1">--全部--</option>',s='<option value="-1">--全部--</option>',d='<option value="-1">--全部--</option>';$.each(e.result,function(e){this.id=e,this.country=$.trim(this.country),this.name=$.trim(this.name),this.code=$.trim(this.code),this.type=$.trim(this.type),this.timeLimit=$.trim(this.timeLimit),this.brand=$.trim(this.brand),this.warehouse=$.trim(this.warehouse),t[this.name]||(t[this.name]=this.name,a+='<option value="'+this.name+'">'+this.name+"</option>"),i[this.code]||(i[this.code]=this.code,s+='<option value="'+this.code+'">'+this.code+"</option>"),n[this.timeLimit]||(n[this.timeLimit]=this.code,d+='<option value="'+this.timeLimit+'">'+this.timeLimit+"</option>")}),$("#J_name,#J_inputName").empty().append(a).selectPicker(),$("#J_code,#J_inputCode").empty().append(s).selectPicker(),$("#J_timeLimit,#J_inputTimeLimit").empty().append(d).selectPicker();var o=Mustache.render($("#J_template").html(),{list:e.result});$("#formList").append(o)}}).fail(function(){alert("查询失败")})}function search(){var e=$.trim($("#J_name").val()),t=$("#J_country").val(),i=$("#J_code").val(),n=$("#J_timeLimit").val(),a=$(".J_type:checked").val(),s=$("#J_warehouse").val();$(".rowList").removeClass("hidden"),""==e&&"-1"==t&&"-1"==i&&"-1"==n&&"-1"==power&&""==s||$(".rowList").each(function(){var d=$(this),o=d.find(".name").text(),c=d.find(".country").text(),r=d.find(".code").text(),l=d.find(".timeLimit").text(),m=d.find(".type").text(),u=d.find(".warehouse").text();"-1"!=t&&("-1"!=c.indexOf(t)?d.removeClass("hidden"):d.addClass("hidden")),"-1"!=e&&(e!=o||d.hasClass("hidden")?d.addClass("hidden"):d.removeClass("hidden")),"-1"!=i&&(i!=r||d.hasClass("hidden")?d.addClass("hidden"):d.removeClass("hidden")),"-1"!=n&&(n!=l||d.hasClass("hidden")?d.addClass("hidden"):d.removeClass("hidden")),"-1"!=a&&(a!=m||d.hasClass("hidden")?d.addClass("hidden"):d.removeClass("hidden")),"-1"!=s&&("-1"==u.indexOf(s)||d.hasClass("hidden")?d.addClass("hidden"):d.removeClass("hidden"))})}function _cancel(){$("#J_inputCountry").val("-1").selectPicker(),$("#J_inputName").val("-1").selectPicker(),$("#J_inputCode").val("-1").selectPicker(),$("#J_inputTimeLimit").val("-1").selectPicker(),$("#J_inputWarehouse").val("-1").selectPicker(),$("#J_selectedCountry,#J_selectedWarehouse").empty(),$("#J_inputBrand").val(""),$("#newBox").addClass("hidden")}function multipleChoice(e,t){var i='<span class="selected-item selectedItem" title="删除">'+e+"</span>";if(-1!=e){var n=!1;t.find(".selectedItem").each(function(){$(this).text()==e&&(n=!0)}),!n&&t.append(i)}}function funDownload(e,t){var i=document.createElement("a");i.download=t,i.style.display="none";var n=new Blob([e]);i.href=URL.createObjectURL(n),document.body.appendChild(i),i.click(),document.body.removeChild(i)}$(document).ready(function(){init(),$("#J_search").off().on("click",search),$("#formSubmit").on("keyup",function(e){13==e.keyCode&&search()}),$("#J_new").on("click",function(){$("#newBox").removeClass("hidden").data("id",$(".rowList").length)}),$("#formList").on("click",".J_update",function(){var e=$(this),t=e.data("id"),i=e.closest(".rowList"),n=i.find(".country").text().split(" "),a=i.find(".warehouse").text().split(" ");$("#newBox").removeClass("hidden").data("id",t),$("#J_inputCountry").val(n[0]).selectPicker(),$("#J_inputName").val(i.find(".name").text()).selectPicker(),$("#J_inputCode").val(i.find(".code").text()).selectPicker(),$("#J_inputTimeLimit").val(i.find(".timeLimit").text()).selectPicker(),$('.J_inputType[value="'+i.find(".type").text()+'"]').prop("checked",!0),$("#J_inputBrand").val(i.find(".brand").text()),$("#J_inputWarehouse").val(a[0]);var s="";$.each(n,function(){""!=this&&(s+='<span class="selected-item selectedItem">'+this+"</span>")}),$("#J_selectedCountry").empty().append(s);var d="";$.each(a,function(){""!=this&&(d+='<span class="selected-item selectedItem" title="删除">'+this+"</span>")}),$("#J_selectedWarehouse").empty().append(d)}),$("#J_inputCountry").on("change",function(){var e=$(this).val(),t=$("#J_selectedCountry");multipleChoice(e,t)}),$("#J_inputWarehouse").on("change",function(){var e=$(this).val(),t=$("#J_selectedWarehouse");multipleChoice(e,t)}),$("#newBox").on("click",".selectedItem",function(){$(this).remove()}),$("#J_sureNew").on("click",function(){var e=$("#newBox").data("id"),t=$(".rowList").length,i="",n=-1!=$.trim($("#J_inputName").val())?$.trim($("#J_inputName").val()):"",a=-1!=$.trim($("#J_inputCode").val())?$.trim($("#J_inputCode").val()):"",s=-1!=$.trim($("#J_inputTimeLimit").val())?$.trim($("#J_inputTimeLimit").val()):"",d=$.trim($("#J_inputBrand").val()),o="",c=$.trim($(".J_inputType:checked").val());if($("#J_selectedCountry .selectedItem").each(function(){i+=" "+$(this).text()}),i=$.trim(i),$("#J_selectedWarehouse .selectedItem").each(function(){o+=" "+$(this).text()}),o=$.trim(o),""==i&&""==n&&""==a&&""==s&&""==d&&""==o&&""==c)return alert("内容为空，请至少设置一项参数");var r=e==t?"新增":"修改";if(confirm("确定"+r+"？")){if(e==t){var l=[];l[0]={},l[0].id=$("#newBox").data("id"),l[0].country=i,l[0].name=n,l[0].code=a,l[0].timeLimit=s,l[0].brand=d,l[0].warehouse=o,l[0].type=c;var m=Mustache.render($("#J_template").html(),{list:l});$("#formList .row").eq(0).after(m)}else{var u=$('.rowList[data-id="'+e+'"]');u.find(".country").text(i),u.find(".name").text(n),u.find(".code").text(a),u.find(".timeLimit").text(s),u.find(".brand").text(d),u.find(".warehouse").text(o),u.find(".type").text(c)}_cancel()}}),$("#J_cancelNew").on("click",function(){_cancel()}),$(document).on("click",function(e){var t=$(e.target);0==t.closest(".container-new,#J_new,.J_update,.selectedItem").length&&_cancel()}),$("#J_save").on("click",function(){var e={},t=[];$(".rowList").each(function(e){var i=$(this);t[e]={},t[e].country=i.find(".country").text(),t[e].name=i.find(".name").text(),t[e].code=i.find(".code").text(),t[e].timeLimit=i.find(".timeLimit").text(),t[e].type=i.find(".type").text(),t[e].brand=i.find(".brand").text(),t[e].warehouse=i.find(".warehouse").text()}),e.result=t,e.success=!0,funDownload(JSON.stringify(e),"brandList.json"),alert('请至 "上传" 菜单栏上传 "brandList.json" 文件')})});