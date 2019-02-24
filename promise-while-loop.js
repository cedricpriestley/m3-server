var Promise = require("bluebird");
var bhttp = require("bhttp");
 
function loop(pageNumber) {
    return Promise.try(function() {
        return bhttp.get("http://api.example.com/page/" + pageNumber);
    }).then(function(response) {
        if (response.headers["x-next-page"] != null) {
            return Promise.try(function() {
                return loop(response.headers["x-next-page"]);
            }).then(function(recursiveResults) {
                return [response.body].concat(recursiveResults);
            });
        } else {
            // Done looping
            return [response.body];
        }
    });
}
 
Promise.try(function() {
    var i = 0;
    
    return loop(1);
}).then(function(results) {
    // Now `results` is an array that contains the response for each HTTP request made.
})