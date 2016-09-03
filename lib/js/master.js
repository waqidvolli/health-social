$(document).ready(function() {

    initHome();

    var groups_html = `<div id="groups-1">
            <div class="well-sm">
                <button class="btn btn-primary" onclick="toggleGroupScreens(2)">Create Group</button>
                <button class="btn btn-info pull-right" onclick="toggleGroupScreens(3)">Join Group</button>
            </div>
            <div>
                <ul class="list-group" id="groups-list">
                    <p> You have no groups </p>
                    <!-- dynamically append user groups     -->
                </ul>
            </div>
        </div>

        <div id="groups-2" style="display:none">
            <button class="btn btn-default" onclick="goBackToGroups()">Back</button></br>
            <input type="text" id="new-group-name" placeholder="Enter new group name..."/>
            <input type="text" id="new-group-access-key" placeholder="Enter access key..."/>
            <button onclick="createNewGroup()">Create</button>
        </div>

        <div id="groups-3" style="display:none">
            <button class="btn btn-default" onclick="goBackToGroups()">Back</button></br>
            <input type="text" id="search-term" placeholder="Search for groups..."/>
            <button onclick="searchByGroupName()">Search</button>
            <div>
                <ul class="list-group" id="search-results">
                    <!-- dynamically append list items     -->
                </ul>
            </div>
        </div>

        <div id="groups-4" style="display:none">
            <button class="btn btn-default" onclick="goBackToGroups()">Back</button></br>
            <p>Users in group</p>
        </div>`;



    $('#groups').html(groups_html);
    loadUserGroups();

    $('#goals-tab').click(function() {
        loadUserGoals();
    });

    $('#home-tab').click(function() {
        initHome();
    });


}); //END of document.ready


function toggleGroupScreens(screen) {
    $('#groups').children().hide();
    $(`#groups-${screen}`).show();
}

function createNewGroup() {
    var group_name = $('#new-group-name').val();
    var group_access_key = $('#new-group-access-key').val();

    $.ajax({
        type: 'POST',
        url: '/api/groups/create',
        data: {
            name: group_name,
            key: group_access_key
        },
        // contentType: "application/json"
    }).done(function(res) {
        toastr.options = {
            "positionClass": "toast-top-center"
        };
        if (res == 'success') {
            toastr.success(`New group ${group_name} successfully created`, '', {
                timeOut: 2000
            });
            goBackToGroups();
            loadUserGroups();
        } else {
            toastr.error(`Group ${group_name} already exists. Please choose another name.`, '', {
                timeOut: 2000
            });
        }

    });
}

function searchByGroupName() {
    var search_term = $('#search-term').val();
    $.getJSON(`/api/search/${search_term}`, function(res) {
        if (res.length > 0) {
            var ulist = $('#search-results');
            ulist.html('');
            $.each(res, function(index, group) {
                ulist.append('<li class="list-group-item" id="' + group.id + '">' + group.name + '</li>')
            });

        }
    });
}

function goBackToGroups() {
    $('#groups').children().hide();
    $('#groups-1').show();
}


function loadUserGroups() {
    $.ajax({
        type: 'GET',
        url: `/api/usergroups/2`,
    }).done(function(res) {
        if (res.length > 0) {
            var ulist = $('#groups-list');
            ulist.html('');
            $.each(res, function(index, group) {
                ulist.append(`<li class="list-group-item" id="group_${group.id}"> ${group.name}  </li>`)
                $(`#group_${group.id}`).click(function() {
                    initGroupUserGoals(group.id);
                    toggleGroupScreens(4);
                });
            });

        } else {

        }


    });
}

function loadUserGoals() {
    $.ajax({
        type: 'GET',
        url: `/api/goals/2`,
    }).done(function(res) {
        var list = $('#activity-list');
        list.html('');
        if (res.length > 0) {
            $.each(res, function(index, goal) {
                list.append(`<div class="well-sm"><input type="text" style="width:50%" value=${goal.activity}>
                    <input type="number" style="width:20%"  value=${goal.target}>
                    <input class="last-activity-item" type="number" style="width:20%"  value=${goal.completed}></div>`);
            });

        } else {
            list.append(`<p>You have not set any goals for this week.</p>`);
        }
    });
}


function addActivity() {
    $('#activity-list').append(`<div class="well-sm"><input type="text" style="width:50%" placeholder="Activity">
        <input type="number" style="width:20%"  placeholder="Minutes">
        <input class="last-activity-item" type="number" style="width:20%"  placeholder="Done"></div>`);
}

function removeActivity() {
    $('#activity-list div').last().remove();
}

function savePlan() {

    $.ajax({
        type: 'POST',
        url: '/api/goals/reset',
        data: {
            user: 2
        }
    }).done(function(response) {
        $(".last-activity-item").each(function() {

            var completed = $(this).val();
            var target = $(this).prev('input').val();
            var activity = $(this).prev('input').prev('input').val();

            $.ajax({
                type: 'POST',
                url: '/api/goals/create',
                data: {
                    user: 2,
                    activity: activity,
                    target: target,
                    completed: completed
                }
            }).done(function(response) {
                loadUserGoals();
            });

        });

        loadUserGoals();
    });


}


function drawCircle(ele, target, percent) {

    var startColor = '#6FD57F'; //FC5B3F
    var endColor = '#6FD57F';
    var circle = new ProgressBar.Circle(ele, {
        color: startColor,
        strokeWidth: 5,
        trailWidth: 2,
        duration: 1500,
        text: {
            value: '0'
        },
        step: function(state, bar) {
            bar.setText((bar.value() * target).toFixed(0) + "min");

        },

    })

    circle.animate(1, function() {

        circle.animate(percent, {
            from: {
                color: startColor
            },
            to: {
                color: endColor
            }
        });
    })
}


function initHome() {

    $.ajax({
        type: 'GET',
        url: `/api/goals/2`,
    }).done(function(res) {
        $('#home').html('<div class="well-sm" id="user-goal-status"></div>');
        var total_target = 0;
        var total_completed = 0;
        $.each(res, function(index, goal) {
            total_target += goal.target;
            total_completed = goal.completed;
        });
        var percent = total_completed / total_target;
        // var percent_text = ((done / target) * 100).toFixed(0);
        var ele = '#user-goal-status';
        // $('#home').append('<li class="list-group-item pull-left" style="width:100%"><div class="pull-left"><h3 class="person-name" name="'+res[i].login_id+'">' + name + '</h3><h5 class="text-danger">' + percent_text + '% <small><i> of '+res[i].target+' mins completed</i></small></h5></div><div id="progress_' + res[i].login_id + '" class="pull-right" style="width:80px"></div></li>');
        drawCircle(ele, total_target, percent)
    });
}



function initGroupUserGoals(group_id) {

    $.ajax({
        type: 'GET',
        url: `/api/groups/${group_id}`,
    }).done(function(res) {
        $('#groups-4').html('<button class="btn btn-default" onclick="goBackToGroups()">Back</button></br>');

        $.each(res, function(index, goal) {
            var total_target = goal.target;
            var total_completed = goal.completed;
            var percent = total_completed / total_target;
            var percent_text = ((total_completed / total_target) * 100).toFixed(0);
            var name = goal.name;
            var ele = '#progress_' + goal.user_id;
            $('#groups-4').append(`<li class="list-group-item pull-left" style="width:100%"><div class="pull-left">
                <h3 class="person-name" name="${goal.user_id}"> ${name}  </h3>
                <h5 class="text-danger"> ${percent_text}% <small><i> of ${goal.target} mins completed</i></small></h5>
                </div><div id="progress_${goal.user_id}" class="pull-right" style="width:80px"></div></li>`);

            drawCircle(ele, total_target, percent)
        })



        // $('.person-name').click(function(){
        //      var person_id = $(this).attr('name');
        //      $.ajax({
        //          type: "POST",
        //          url: "view_friend_plan.php",
        //          data:{
        //              login_id:person_id
        //          }
        //      }).done(function(response) {
        //          console.log(response)
        //          $('.modal-body').html("");
        //          if (response.charAt(response.length - 3) == ',') {
        //              response = response.substr(0, response.length - 3) + "]";
        //          }
        //          var res = JSON.parse(response);
        //          for(var i=0;i<res.length;i++){
        //              $('.modal-body').append("<h4><small>"+res[i].activity+" </small>"+res[i].target+"<small> mins</small></h4>")
        //          }
        //          $('#plan-modal').modal();

        //      })
        //  });

    });
}