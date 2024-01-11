var express = require('express');
var app = express();

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();


app.set('port', process.env.PORT || 8080);

app.use(express.static(__dirname));

//------------------------------------------------------------------------------------------------------
// Instantiate Node.js file services and use them to do the following:
var nodeJsFileServices = require("fs");

// "Include" the code in these copymembers by way of doing a synchronous read of the file contents and
// "evaluating" them, thus including their bodies within the body of this script.

// NOTE: "require()" is not used because this is an existing JavaScript application which employs global
// functions combined on an HTML page:

eval(nodeJsFileServices.readFileSync("StandardStreams.js", "utf8"));
eval(nodeJsFileServices.readFileSync("UnicodeASCII.js", "utf8"));
eval(nodeJsFileServices.readFileSync("WikipediaDiscography.js", "utf8"));
eval(nodeJsFileServices.readFileSync("WorkingWebBrowserServices.js", "utf8"));

eval(nodeJsFileServices.readFileSync("hardcoded_main.js", "utf8"));
eval(nodeJsFileServices.readFileSync("hardcoded_studio_albums.js", "utf8"));
eval(nodeJsFileServices.readFileSync("hardcoded_live_albums.js", "utf8"));

// NOTE: This is for error handling only.  When there is no GUI, as in our usage here,
// all errors are routed to the console:
var standard_streams_services = new standard_streams;

// These runtime parameters are filled from argument processing, below:
var online = true;
var offline_discographies_json;
var artist_array = [];

function wikipedia_discography_argument(url_search) {

    // NOTE: Since these variables are defined in the mainline process, they will be initialized only once,
    // when the process's "dyno" is started up on Heroku.  Thus the variables' lifetimes could span
    // multiple runs of the app.get/request/response process.  When this occurs, the array will fill up
    // cumulatively and the string will retain its prior value and give undesired results on the final
    // output.  Thus, we will re-init and purge the array before use/re-use:
    online = true;
    offline_discographies_json = "";

    while (artist_array.length > 0) {
        artist_array.pop();
    }

    // NOTE: I code for the following scenarios only (not all possible ones):

    //------------------------------------------------------------------------------------------
    // Test scenario 1: An offline discography:

    // NOTE: This file is stored here:
    //C:\a_dev\NodeJS\wikipediadiscography\wikipediadiscography\file_input_demo.js

    // ?offline=file_input_demo.txt
    //------------------------------------------------------------------------------------------
    // Test scenario 2: An online discography.
    //
    // NOTE: An online discography is implied by the presence of artist argument(s).
    //
    // NOTE 2: Since I'm using the URL argument to pass artists, only a limited number
    // of artists may be passed.
    //
    // ?artist=Bruce+Springsteen&artist=Electric+Light+Orchestra&artist=Elton+John
    //------------------------------------------------------------------------------------------

    // Since we will be modifying the argument, let's make a copy and work with that:
    var url_search_edited = url_search;

    // Regularize the URL arguments and replace plus signs with spaces:
    url_search_edited = url_search_edited.replace("?", "&");
    url_search_edited = replace_all(url_search_edited, "\\+", " ");

    // Single argument 1 of 2:

    // Look for the Offline argument:
    if (url_search_edited.toLowerCase().indexOf("offline=") > -1) {

        online = false;

        // Look for the Offline argument, a file name, and get and save its contents:

        // NOTE: This is a synchronous read on Node.js.  If the JSON file is too big the read
        // will timeout and crash.  You can switch to an asynchronous read and it will complete
        // however the follow-up processing would have to be altered to behave in an asynch
        // manner and this is overkill for a simple demonstration process.  The standard process
        // can handle large runs.

        // NOTE 2: When I used a file with a .JSON suffix, it failed so I switched to .TXT

        offline_discographies_json =
            nodeJsFileServices.readFileSync(
                "./" +
                url_search_edited.substring(url_search_edited.indexOf("=") + 1),
                "utf8"
            );

    }

    // Argument group  2 of 2:

    // Look for the Artist(s) argument(s):
    if (online == true) {

        // Put the arguments in an array for easy handling:
        var search_array = url_search_edited.split("&");

        // Offload Artist names from the array in URL format to an array in Wikipedia-ready format:
        for (var i = 0; i < search_array.length; ++i) {

            // Isolate the artist's name and load the Wikipedia-ready format:
            var index = search_array[i].indexOf("artist=");

            if (index > -1) {
                artist_array.push(search_array[i].substring(index + 7));
            }

        }

    }

}

//- - - - - - - - - - - - - - - - - - - - - - - - - 
// TO DEBUG, COMMENT OUT:
app.get(
    '/',
    function (request, response) {

        // Prevent timeouts:
        request.setTimeout(600000) // 10 minutes
        response.setTimeout(600000); // 10 minutes
//- - - - - - - - - - - - - - - - - - - - - - - - - 

        // NOTE: The complicated module-invocation process across four applications, WD,
        // YA, WD Node and YA Node is described in document:
        // C:\a_dev\NodeJS\wikipediadiscography\documents\WD & YA high-level calls.txt
        
        // Initialize Wikipedia discography startup services:
        var wikipedia_discography_startup_services = new wikipedia_discography_startup();

        // Get the URL arguments:
        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // TO DEBUG, COMMENT OUT:
        var url_search = require("url").parse(request.url).search;
        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // TO DEBUG, UNCOMMENT ONE:
      //var url_search = "?artist=ABBA";
      //var url_search = "?offline=file_input_demo.txt";
        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // Since this app has no GUI, it relies on the URL for arguments:
        var artists_discographies_string = "<br>no URL arguments provided"; // init

        if (url_search != null) {

            // NOTE: This object will retain information about the URL arguments as passed
            // for subsequent reference:
            wikipedia_discography_argument(url_search);

            // Online discographies come live from the Wikipedia website:
            if (online == true) {

                artists_discographies_string =
                    wikipedia_discography_startup_services.get_artists_discographies_core(
                        true,           // discography_online
                        "",             // offline_discographies
                        artist_array,   // artist_array
                        "HTML"          // discography_format
                    );

                // Offline discographies are static and come from JSON stored in a file:
            } else {

                artists_discographies_string =
                    wikipedia_discography_startup_services.get_artists_discographies_core(
                        false,                      // discography_online
                        offline_discographies_json, // offline_discographies:
                        [],                         // artist_array
                        "HTML"                      // discography_format
                    );
            }
   
        }

        // Create and write the HTML page:

        var html_page =

            //----------------------------------------------------------------------------------
	    // Head:
	    "<!DOCTYPE html><html>" +             
            "<meta id='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'>" +            
            "<head><title>Wikipedia Discography Reader</title>" +

            "<script>" +
                nodeJsFileServices.readFileSync("WorkingWebBrowserServices.js", "utf8") +
            "</script>" +
            "<style>" +
	            nodeJsFileServices.readFileSync("Site.css", "utf8") +
 	        "</style>" +
            "</head>" +

            //----------------------------------------------------------------------------------
	        // Body:
 	        "<body>"+
 	        '<div class="BannerDiv"><br><table><tbody><tr>' +
                '<td class="BannerTD"><img src="wikipedia.png" alt="Wikipedia Logo"></td>' +
                '<td class="BannerTD BannerText">Discography Reader</td></tr></tbody></table></div><br>' +
            '<button class="button" onClick="open_popup_window(\'http://www.workingweb.info/WikipediaDiscographyNodeJsAbout\', true, \'no\', \'no\', 505, 640);">About</button><br><br>' +
 	        artists_discographies_string +
 	        "</body></html>";

        //- - - - - - - - - - - - - -
        // TO DEBUG, COMMENT OUT:
        response.write(html_page);
        // End the process:
        response.end();
        }
        );
        //- - - - - - - - - - - - - -

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



