//some model require
var express = require('express'),
    req = require('request'),
    fs = require('fs'),
    app = module.exports = express.createServer();

//app config
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.set('view options', {
        layout: false
    });
});

//index for introduce and example 
app.get('/', function(require, response){
    response.render('index');
});
app.post('/decode/*', function(require, response){
    var reg_header = /^chrome-extension:/;
    if (reg_header.test(require.headers.origin)) {
        console.log(require.headers.origin + '======================' + Date() + "===================");
        var img = require.body.img, name = Math.floor(Math.random() * 100) + '.png', reg_base64 = /base64/, reg_pic = /^<!DOCTYPE/, reg_err = /^<html>/;
        if (reg_base64.test(img)) {//data-uri pic
            var str = img.split(';base64,');
            fs.writeFile('public/' + name, new Buffer(str[1], 'base64'), function(err){
                if (err) 
                    throw err;
                decode(name);
            });
            
        }
        else {//url pic
            console.log('img======' + img);
            req.get({
                uri: img,
                encoding: 'binary',
                timeout: 15000
            }, function(err, resp, body){
                fs.writeFile('public/' + name, body, encoding = 'binary', function(err){
                    if (err) 
                        throw err;
                    decode(name);
                });
            });
        }
        function decode(img){
            var url = 'http://zxing.org/w/decode?u=';//decode API
            url += encodeURIComponent('http://204.12.225.114/' + img);//temp pic for data-uri pic or to long url pic
            console.log('url=======' + url);
            req(url, function(error, res, body){
                if (!error && res.statusCode == 200) {
                    reg_pic.test(body) || reg_err.test(body) ? body = '<span class="erro">无法识别！</span>' : body = body.trim();
                    console.log(body);
                    resText(body);
                    fs.unlink('public/' + name, function(err){//remove temp pic
                        if (err) 
                            throw err;
                    });
                }
            });
        }
    }
    else {
        resText('<span class="erro">非法请求！</span>');
    }
    function resText(text){
        response.charset = 'utf-8';
        response.header('Content-Type', 'text/html');
        response.write(text);
        response.end();
    }
});
app.listen(80);
console.log('Server running');
