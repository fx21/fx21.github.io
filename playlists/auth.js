
// grab the GET parameters in case we have an auth code or state

old_hash = "#"
HASH_PARAMS = []

token = null
valid_until = null

user_id = null
user_country = null

function token_valid() {

    return token != null

}

function add_token_header(request) {

    if (token_valid()) {

        request.setRequestHeader("Authorization","Bearer "+token)

    }

}

function make_parameters(s) {

    if (s.length == 0) {
        return
    }

    s.substring(1).split('&').forEach(function(a){

        b = a.split("=")
        HASH_PARAMS[b[0]] = b[1]

    })

}

function load_token() {

    if (typeof HASH_PARAMS['access_token'] != "undefined") {

        token = HASH_PARAMS['access_token']

    }

}

function do_sign_in() {

    base_url = "http://fx21.github.io/playlists/"
    scope = "user-read-private user-top-read user-follow-read playlist-modify-public playlist-modify-private"

    //<a href='https://accounts.spotify.com/authorize/?client_id=6c687a3e2125432db6b91368aa48cad0&response_type=token&redirect_uri=http%3A%2F%2Ffx21.github.io%2Fplaylists%2F&scope=user-read-private%20user-top-read&state=34fFs29kd09' target='_blank'>Sign in</a>

    url = "https://accounts.spotify.com/authorize/?client_id=6c687a3e2125432db6b91368aa48cad0&response_type=token&redirect_uri="+encodeURIComponent(base_url)+"&scope="+encodeURIComponent(scope)+"&state=34fFs29kd09"

    window.location.replace(url)

}

function validate_token_callback(response) {

    user_id = response["id"]
    user_country = response["country"]

    $("p.market_p select").val(user_country)

    $("#signinbtn").addClass("btn-success").prop("disabled",true).text('Signed in as '+user_id)

}

function validate_token_error(response) {

    token = null

}

function validate_token() {

    // try to grab the current user name and find out if the token is valid in the process

    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        beforeSend: add_token_header,
        data: {
        },
        success: validate_token_callback,
        error: validate_token_error
    });


}

make_parameters(location.hash)
load_token()

// clear data for now
old_hash = location.hash
window.location.replace("#")

validate_token()


