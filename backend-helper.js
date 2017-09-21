module.exports = {
  lengthInUtf8Bytes : function(string) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  },

  onError : function(error, httpRequest, httpResponse) {
    console.log(error.message, error.stack);
    if (httpResponse != undefined) {
      httpResponse.header("Access-Control-Allow-Origin", "*");
      var errMsgForClient = "{'errorMessage': '" + error.message + "', 'errorStack': '" + error.stack + "'}";
      httpResponse.header('Content-Length', errMsgForClient.length);
      httpResponse.header('Transfer-Encoding', '');
      httpResponse.writeHead(500, {
        "Content-Type" : "application/json"
      });
      httpResponse.write(errMsgForClient);
    }
  }
}