
/* Copyright 2014 Intel Corporation, All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the"License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the
 specific language governing permissions and limitations
 under the License.
 */

(function() {
    $(".create-cluster-commit").live("click", function(){
        var rows_num = $(".modal-body .zone").length - 1;
        console.log(rows_num);
        var data_list = new Array();
        if (rows_num < 3)
        {
            alert("You must have at least 3 servers");
            return;
        }
        var mon_num = 0;
        for (var i=1; i <= rows_num; i++)
        {
            row_id = $($(".server_id")[i]).html();
            row = $("#clusteraction__row__" + row_id);
            console.log(row_id);
            checked = row.find(".multi_select_column").find("input").is(":checked");
            if(checked == true)
            {
                id = row.find(".multi_select_column").find("input").val();
            }else{
                id = row.find(".server_id").html();
                console.log("pass");
                //continue;
            }
            console.log(id);
            console.log(row);
            zone_id = row.find(".zone").find("select").val();
            is_monitor = row.find(".is_monitor").find("input").attr("checked") ? true : false;
            is_storage = row.find(".is_storage").find("input").attr("checked") ? true : false;
            data = {id:id, is_monitor:is_monitor, is_storage:is_storage, zone_id:zone_id};
            data_list.push(data);
            console.log(data_list);
            if (is_monitor){
                mon_num += 1;
            }
        }
        //if (mon_num < 3){
        //    alert("monitor must > 2");
        //    return;
        //}
        data_list_json = JSON.stringify(data_list);
        console.log(data_list);
        token = $("input[name=csrfmiddlewaretoken]").val();
        modal_stack = $("#modal_wrapper .modal");
        horizon.modals.modal_spinner(gettext("Working"));
        horizon.ajax.queue({
            data: data_list_json,
            type: "post",
            dataType: "json",
            url: "/dashboard/vsm/clustermgmt/cluster/create",
            success: function (data) {
                //prepare refresh status
                for( x in data_list){
                    $("#server_list__row__"+data_list[x]['id']).addClass("status_unknown").removeClass("status_up");
                    $("#server_list__row__"+data_list[x]['id']).find(".status_up").addClass("status_unknown").removeClass("status_up");
                }
                console.log(data.status);
                horizon.alert(data.status, data.message);
                setTimeout(horizon.datatables.update, 2000);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                horizon.alert("error", "Network Error");
                horizon.modals.spinner.modal('hide');
            },
            headers: {
              "X-CSRFToken": token
            },
            complete: function(){
                horizon.modals.spinner.modal('hide');
                modal_stack.remove();
            }
        });
        $(this).closest('.modal').modal('hide');
    });
    var check_status = function(){
        var _check_status = function(){
            var status = null;
            var server_list = $("#server_list tbody tr");
            for(var i=0; i<server_list.length; i++){
                status =  $(server_list[i]).find("td").last().html();
                if(status !== "Active"){
                    return false;
                }
            }
            return true;
        }
        var status = _check_status();
        if(status){
            $(".sidebar").find("a").each(function(){
                $(this).attr("href", $(this).attr("href").replace("#",""));
            });
        } else {
            var href = "";
            $(".sidebar").find("a").each(function(){
                href = $(this).attr("href");
                if(href[0] != "#"){
                    $(this).attr("href", "#"+href);
                }
            });
        }
    }
    var init = function(){
        if($(".btn-create").length){
            setInterval(check_status, 1000);
        }
    }
    $(document).ready(function(){
        init();
    });
})(jQuery)
