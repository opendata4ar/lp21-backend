module.exports = {
  lengthInUtf8Bytes : function(string) {
    // Need to set Content-Length explicitly just to avoid Transfer-Encoding: chunked
    //JS string.length does not account for utf-8 encoding
    // see https://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(string).match(/%[89ABab]/g);
    return string.length + (m ? m.length : 0);
  },

  onError : function(error, httpRequest, httpResponse) {
    console.log(error.message, error.stack);
    if (httpResponse != undefined) {
      httpResponse.header("Access-Control-Allow-Origin", "*");
      var errMsgForClient = "{'errorMessage': '" + error.message + "', 'url': '" + httpRequest.url + "', 'errorStack': '" + error.stack + "'}";
      httpResponse.header('Content-Length', errMsgForClient.length);
      httpResponse.header('Transfer-Encoding', '');
      httpResponse.writeHead(500, {
        "Content-Type" : "application/json"
      });
      httpResponse.write(errMsgForClient);
    }
  },

  pause : function(millis) {
    var date = new Date();
    var curDate = null;
    do {
      curDate = new Date();
    } while (curDate - date < millis);
  }
}