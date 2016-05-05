
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

        id = a["id"]

        $("#playlistsModalTable").append('<tr><td><img width="60" height="60" src="'+img_url+'"></td><td>'+name+' <br><strong>'+num+' tracks</strong></td><td><button type="button" class="btn btn-primary" onclick="add_selected_playlist(\''+id+'\')">Select</button></td></tr>')

    })

    $("#playlistModalCog").addClass("hide")

}

function playlist_select_error() {

}

function popup_playlist_select() {

    if (token_valid()) {

        $("#playlistsModalTable").html('')

        $.ajax({
            url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
            beforeSend: add_token_header,
            data: {
                limit: 50
            },
            success: playlist_select_callback,
            error: playlist_select_error
        });


    }

}
