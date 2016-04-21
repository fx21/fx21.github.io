
playlist_source_name = "nothing"
playlist_fuzziness = 2

function make_new_playlist_name() {

    // try to express the fuzziness as a text to use as the playlist name

    fuzzy_flavor = ["random tracks from"]

    if (playlist_fuzziness == 1) {
        fuzzy_flavor = ["tracks from {}",
            "tried and true from {}",
            "nothing but {}",
            "{} playlist",
            "{} list"]
    } else if (playlist_fuzziness == 2) {
        fuzzy_flavor = ["tracks related to {}",
            "tracks from and related to {}",
            "{} and related",
            "{} and more",
            "{} etc"]
    } else if (playlist_fuzziness <= 5) {
        fuzzy_flavor = ["random tracks related to {}",
            "rando tracks for {}",
            "adventurous list based on {}",
            "fuzzy list: {}"]
    } else if (playlist_fuzziness <= 10) {
        fuzzy_flavor = ["very random tracks related to {}",
            "crazy list based on {}"]
    } else if (playlist_fuzziness <= 20) {
        fuzzy_flavor = ["very VERY random tracks related to {}",
            "{}: i don't even know edition"]
    } else {
        fuzzy_flavor = ["super random tracks having almost no relation to {}",
            "a musical adventure featuring {}",
            "a random walk from {}",
            "{}: a random walk",
            "{} and lots of others"]
    }

    len = fuzzy_flavor.length
    use_flavor = fuzzy_flavor[Math.floor(len*Math.random())]

    smile = [":o)",":)",":D","=^_^="]
    use_smile = smile[Math.floor(smile.length*Math.random())]

    $("#plname").val(use_flavor.replace("{}",playlist_source_name) + " " + use_smile)

}

function update_source_name(new_name) {

    playlist_source_name = new_name

    make_new_playlist_name()
}

function update_fuzziness() {

    playlist_fuzziness = parseInt($("#plfuzz").val())

    make_new_playlist_name()
}

function update_seed_source() {

    artists = $("#seedarea").val().split("\n").filter(function(s){return s})

    value = "nothing"

    if (artists.length == 1) {
        value = artists[0]
    } else if (artists.length == 2) {
        value = artists[0] + " and " + artists[1]
    } else if (artists.length == 3) {
        value = artists[0] + ", " + artists[1] + ", and " + artists[2]
    } else if (artists.length > 20) {
        value = "a whole bunch of artists"
    } else {
        value = artists[0] + ", " + artists[1] + ", " + artists[2] + ", and others"
    }

    update_source_name(value)

}

function clear_list() {

    $("#seedarea").val('')

    update_source_name("nothing")

}

function add_to_seed(string) {

    prev_val = $("#seedarea").val()

    // in case the text area doesn't end in a newline, add it

    if (prev_val.length > 0 && !prev_val.endsWith('\n')) {
        $("#seedarea").val($("#seedarea").val()+"\n");
    }

    $("#seedarea").val($("#seedarea").val()+string+"\n");

}

function user_top_callback(response) {

    response["items"].forEach(function(a) {

        add_to_seed(a["name"]);

    })

}

function user_top_artists(length) {

    if (token_valid()) {

        $.ajax({
            url: 'https://api.spotify.com/v1/me/top/artists',
            beforeSend: add_token_header,
            data: {
                time_range: length,
                limit: 50
            },
            success: user_top_callback
        });

        if (length == 'short_term') {
            update_source_name("my recent top artists")
        } else if (length == 'long_term') {
            update_source_name("my all time top artists")
        } else {
            update_source_name("my top artists")
        }


    }

}

function user_followed_callback(response) {

    response["artists"]["items"].forEach(function(a) {

        add_to_seed(a["name"]);

    })

    // check if there's more

    cursor_after = response["artists"]["cursors"]["after"]

    if (cursor_after) {

        $.ajax({
            url: 'https://api.spotify.com/v1/me/following',
            beforeSend: add_token_header,
            data: {
                type: 'artist',
                limit: 50,
                after: cursor_after
            },
            success: user_followed_callback
        });

    }

}

function user_followed_artists() {

    if (token_valid()) {

        $.ajax({
            url: 'https://api.spotify.com/v1/me/following',
            beforeSend: add_token_header,
            data: {
                type: 'artist',
                limit: 50
            },
            success: user_followed_callback
        });

        update_source_name("my followed artists")

    }

}

function related_artists_callback(response) {

    response["artists"].forEach(function(a) {

        add_to_seed(a["name"]);

    })

}

function search_artist_callback(response) {

    a = response["artists"]["items"][0]

    add_to_seed(a["name"]);
    id = a["id"]

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/'+id+'/related-artists',
        beforeSend: add_token_header,
        data: {
        },
        success: related_artists_callback
    });

}

function searchArtist(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        beforeSend: add_token_header,
        data: {
            q: query,
            type: 'artist'
        },
        success: search_artist_callback
    });
};

function related_search() {

    searchArtist($("#relartists").val())

    update_source_name($("#relartists").val())

}

function search_genre_callback(response) {

    response["artists"]["items"].forEach(function(a) {

        add_to_seed(a["name"]);

    })

}

function searchGenre(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        beforeSend: add_token_header,
        data: {
            q: query,
            type: 'artist'
        },
        success: search_genre_callback
    });
};

function genre_search() {

    searchGenre("genre:"+$("#genresearch").val())

    update_source_name($("#genresearch").val())

}

function years_search() {

    searchGenre("year:"+$("#yearssearch").val())

    update_source_name("years "+$("#yearssearch").val())

}

function editor() {

    editors_picks.forEach(function(a){

        add_to_seed(a);

    })

    update_source_name("dj meow mix top 500")

}

function pllen(value) {

    $("#plsize").val(value)

}

function fuzz(value) {

    $("#plfuzz").val(value)

    update_fuzziness()

}

// a bunch of state variables between calls

current_seed_set = null
current_track_index = -1

current_artist_id = null

found_artist_name = null
found_album_name = null

found_artist_url = null
found_album_url = null

current_max_tracks = -1
current_num_runs = -1
current_max_steps = -1

current_run = -1
current_step = -1

generated_list = []

global_x = null

function run_error_callback(x, status, error) {

    // 429, too many requests, is handled by sleeping for a while and then jumping back in

    if (x.status == 429) {

        $("#plbar").html('Waiting for server').addClass('progress-bar-warning')

        setTimeout("jump_to_related()", 10000)
        return

    }

    // general unhandled errors, display something and try to work around it in the future

    $("#savebtn").prop("disabled",false)
    $("#rawbtn").prop("disabled",false)
    $("#cog").css("visibility","hidden")

    $("#plbar").attr('aria-valuenow', 100).css('width','100%').html('unknown error').toggleClass('active').toggleClass('progress-bar-danger')

    global_x = x

    $("#plbar").html(x.responseJSON.error.status+' '+x.responseJSON.error.message)

}

function quit_playlist() {

    $("#savebtn").prop("disabled",false)
    $("#rawbtn").prop("disabled",false)
    $("#cog").css("visibility","hidden")

    $("#plbar").attr('aria-valuenow', 100).css('width','100%').html('100%').toggleClass('active').toggleClass('progress-bar-success')

}

function chain_related_callback(response) {

    a = response["artists"]
    len = a.length

    random_item = a[Math.floor(len*Math.random())]

    chain_artist(random_item)

}

function jump_to_related() {

    id = current_artist_id

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/'+id+'/related-artists',
        beforeSend: add_token_header,
        data: {
        },
        success: chain_related_callback,
        error: run_error_callback
    });

}

function doNextTrack() {

    // track was recently added to list. check the current state and determine what to
    // do next (new chain, next related, or quit)

    current_track_index++
    current_step++

    if (current_track_index > current_max_tracks) {

        //we've reached the limit, quit

        quit_playlist()

    } else if (current_step > current_max_steps-1) {

        start_chain()

    } else {

        jump_to_related()

    }

}

function update_progress() {

    percent = Math.floor(100*current_track_index/current_max_tracks)

    $("#plbar").attr('aria-valuenow', percent).css('width',percent+'%').html(percent+'%').removeClass('progress-bar-warning')

}

function chain_track_callback(response) {

    a = response["items"]
    len = a.length

    random_item = a[Math.floor(len*Math.random())]
    id = random_item["id"]

    track_url = random_item["external_urls"]["spotify"]

    generated_list.push(random_item["uri"])

    $("#output_table").append("<tr><td>"+current_track_index+"</td><td><a href='"+found_artist_url+"' target='_blank'>"+found_artist_name+"</a></td><td><a href='"+found_album_url+"' target='_blank'>"+found_album_name+"</a></td><td><a href='"+track_url+"' target='_blank'>"+random_item["name"]+"</a></td></tr>")
    $("#rawarea").val($("#rawarea").val()+random_item["uri"]+"\n");

    update_progress()

    setTimeout("doNextTrack()",1)

}

function get_market() {
    return $("p.market_p select").val()
}

function add_market(data) {

    use_market = get_market()

    if (use_market != "AA") {
        data["market"] = use_market
    }

}

function chain_album_callback(response) {

    a = response["items"]
    len = a.length

    if (len < 1) {

        //no albums, jump on
        jump_to_related()
        return

    }

    random_item = a[Math.floor(len*Math.random())]
    id = random_item["id"]

    found_album_name = random_item["name"]
    found_album_url = random_item["external_urls"]["spotify"]

    use_data = {}
    add_market(use_data)

    $.ajax({
        url: 'https://api.spotify.com/v1/albums/'+id+'/tracks',
        beforeSend: add_token_header,
        data: use_data,
        success: chain_track_callback,
        error: run_error_callback
    });

}

function chain_artist(a) {

    id = a["id"]
    found_artist_name = a["name"]
    found_artist_url = a["external_urls"]["spotify"]

    current_artist_id = id

    use_data = {type:"album"}
    add_market(use_data)

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/'+id+'/albums',
        beforeSend: add_token_header,
        data: use_data,
        success: chain_album_callback,
        error: run_error_callback
    });

}

function chain_artist_callback(response) {

    a = response["artists"]["items"][0]

    chain_artist(a)

}

function pick_random_from_seed_set() {

    len = current_seed_set.length
    return current_seed_set[Math.floor(Math.random()*len)]

}

function start_chain() {

    starting_point = pick_random_from_seed_set()

    current_step = 0
    current_run++

    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        beforeSend: add_token_header,
        data: {
            q: starting_point,
            type: 'artist'
        },
        success: chain_artist_callback,
        error: run_error_callback
    });

}

function make_chains(seed_set, num_runs, max_steps) {

    current_seed_set = seed_set
    current_num_runs = num_runs
    current_max_steps = max_steps

    current_track_index = 1
    current_step = 0
    current_run = 0

    start_chain()

}

function make_it() {

    /*
    counter = 1

    $("#seedarea").val().split("\n").filter(function(s){return s}).forEach(function(a) {

        $("#output_table").append("<tr><td>"+counter+"</td><td>"+a+"</td></tr>")

        counter++

    })*/

    plsize = parseInt($("#plsize").val())
    plfuzz = parseInt($("#plfuzz").val())

    num_runs = Math.max(plsize/plfuzz, 1) //make x runs with fuzz number of jumps, at least 1
    max_steps = Math.min(plsize, plfuzz) //however, don't go longer than the number of tracks (probably checked later as well)

    current_max_tracks = plsize

    $("#makebtn").prop("disabled",true)
    $("#cog").css("visibility","visible")

    make_chains($("#seedarea").val().split("\n").filter(function(s){return s}), num_runs, max_steps)

}

function rawdata() {

    $("#rawarea").toggleClass("hidden")

}

current_playlist_save_offset = 0
current_playlist_save_id = null

function chunk_save_error(response) {

    $("#savebtn").addClass("btn-danger").text("Save failed at track "+(current_playlist_save_offset-100))

}

function save_next_chunk() {

    if (current_playlist_save_offset >= generated_list.length) {

        //we're past the end of the list, time to stop saving
        $("#savebtn").addClass("btn-success").text("Saved")
        return

    }

    databody = '{"uris":['

    for (i = 0; i < 100; i++) {

        index = current_playlist_save_offset+i

        if (index < generated_list.length) {
            databody += '"'+generated_list[index]+'"'
        }

        //if we're not at the last element, add a comma

        if (i < 99 && index < generated_list.length-1) {
            databody += ','
        }

    }

    databody += ']}'

    //databody = '{"uris":["spotify:track:1i766mVakKAs6VD0tf9deg"]}'

    current_playlist_save_offset += 100

    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists/'+current_playlist_save_id+'/tracks',
        method: "POST",
        beforeSend: add_token_header,
        data: databody,
        success: save_next_chunk,
        error: chunk_save_error
    });

}

function save_playlist_callback(response) {

    //playlist created, push tracks to it

    current_playlist_save_id = response["id"]
    save_next_chunk()

}

function save_playlist_error(response) {

    $("#savebtn").addClass("btn-danger").text("Save failed")

}

function save_playlist() {

    use_playlist_name = $("#plname").val().split('"').join('\\"')

    if (token_valid()) {

        $.ajax({
            url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
            method: "POST",
            beforeSend: add_token_header,
            data: '{"name":"'+use_playlist_name+'","public":true}',
            success: save_playlist_callback,
            error: save_playlist_error
        });

        $("#savebtn").prop("disabled",true)

    }

}

function start_over() {

    window.location.replace(old_hash)
    window.location.reload(true)

}

