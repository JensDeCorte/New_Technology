var loadTextResource = function (url, callback) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);

  request.onload = function(){
    if (request.status < 200 || request.status > 299){
      callback('Error: HTTP Status ' + request.status + ' on request ' + url);
    } else {
      callback(null, request.responseText);
    }
  };

  request.send();
};

var loadImageResource = function (url, callback) {
  var image = new Image();
  image.onload = function () {
    callback(null, image);
  };
  image.src = url;
};

var loadJSONResource = function (url, callback) {
  loadTextResource(url, function (error, result) {
    if(error){
      callback(error);
    } else {
      try{
        callback(null, JSON.parse(result));
      }
      catch(e){
        callback(e);
      }
    }
  });
};
