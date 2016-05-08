
function playlist_select_select_callback(response) {

    added_already = []

    response["tracks"]["items"].forEach(function(a) {

        a["track"]["artists"].forEach(function(b) {

            if (!(b["id"] in added_already)) {

                add_to_seed(b["name"])
                added_already[b["id"]] = b["name"]
            }

        })

    })

}

function playlist_select_select_error() {

}

function add_selected_playlist(href,name) {

    update_source_name('artists in playlist "'+name+'"')

    $.ajax({
        url: href,
        beforeSend: add_token_header,
        data: {
            fields:"tracks(items(track(artists(name,id))))"
        },
        success: playlist_select_select_callback,
        error: playlist_select_select_error
    });

}

function playlist_select_callback(response) {

    response["items"].forEach(function(a) {

        name = a["name"]

        img = a["images"]
        img_2 = img[2]
        img_url = ""

        if (typeof img_2 != "undefined") {
            img_url = img_2["url"]
        } else if (img.length > 0) {
            img_url = img[0]["url"]
        }

        num = a["tracks"]["total"]

        href = a["href"]

        escaped_name = name.split('"').join('').split("'").join('')

        $("#playlistsModalTable").append('<tr><td><img width="60" height="60" src="'+img_url+'"></td><td>'+name+' <br><strong>'+num+' tracks</strong></td><td><button type="button" class="btn btn-primary" onclick="add_selected_playlist(\''+href+'\',\''+escaped_name+'\')" data-toggle="modal" data-target="#playlistSelectModal">Select</button></td></tr>')

    })

    $("#playlistModalCog").addClass("hidden")

}

function playlist_select_error() {

}

function display_empty_playlist_select() {

    $("#playlistsModalTable").html('<tr><td>You must be signed in to access your playlists.</td></tr>')
    $("#playlistModalCog").addClass("hidden")

}

function popup_playlist_select() {

    if (token_valid()) {

        $("#playlistsModalTable").html('')

        $.ajax({
            url: 'https://api.spotify.com/v1/me/playlists',
            beforeSend: add_token_header,
            data: {
                limit: 50
            },
            success: playlist_select_callback,
            error: playlist_select_error
        });


    } else {

        display_empty_playlist_select()

    }

}
