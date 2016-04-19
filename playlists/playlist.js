
function related_artists_callback(response) {

    response["artists"].forEach(function(a) {

        $("#seedarea").val($("#seedarea").val()+a["name"]+"\n");

    })

}

function search_artist_callback(response) {

    a = response["artists"]["items"][0]

    $("#seedarea").val($("#seedarea").val()+a["name"]+"\n");
    id = a["id"]

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/'+id+'/related-artists',
        data: {
        },
        success: related_artists_callback
    });

}

function searchArtist(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'artist'
        },
        success: search_artist_callback
    });
};

function related_search() {

    searchArtist($("#relartists").val())

}

function search_genre_callback(response) {

    response["artists"]["items"].forEach(function(a) {

        $("#seedarea").val($("#seedarea").val()+a["name"]+"\n");

    })

}

function searchGenre(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'artist'
        },
        success: search_genre_callback
    });
};

function genre_search() {

    searchGenre("genre:"+$("#genresearch").val())

}

function years_search() {

    searchGenre("year:"+$("#yearssearch").val())

}

function editor() {

    editors_picks.forEach(function(a){

        $("#seedarea").val($("#seedarea").val()+a+"\n");

    })

}

function pllen(value) {

    $("#plsize").val(value)

}

function fuzz(value) {

    $("#plfuzz").val(value)

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

use_market = "SE"

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

    $.ajax({
        url: 'https://api.spotify.com/v1/albums/'+id+'/tracks',
        data: {
            market: use_market
        },
        success: chain_track_callback,
        error: run_error_callback
    });

}

function chain_artist(a) {

    id = a["id"]
    found_artist_name = a["name"]
    found_artist_url = a["external_urls"]["spotify"]

    current_artist_id = id

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/'+id+'/albums',
        data: {
            type: "album",
            market: use_market
        },
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

