
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
            type: 'artist',
            limit: 50
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
