var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html')

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            var title = 'WEB';
        }
        fs.readdir('data', function(error, filelist){
            var filteredId = path.parse(title).base;
	        fs.readFile(`data/${filteredId}`, 'utf-8', function(err, description){
                var sanitizedTitle = sanitizeHtml(title);
                var sanitizedDescription = sanitizeHtml(description, {
                    allowedTags:['h1']
                });
                var list = template.list(filelist);
                var html= template.HTML(sanitizedTitle, list, sanitizedDescription, 
                    `
                    <a href="/create">create</a>
                    <a href="/update?id=${sanitizedTitle}">update</a>
                    <form action="delete_process" method="POST">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>
                    `
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/create') {
        fs.readdir('./data', function(error, filelist){
            title = 'WEB - create';
            var list = template.list(filelist);
            var html= template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p>
                        <input type="text" name="title" placeholder="title">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', function(error, filelist){
	    var filteredId = path.parse(title).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var list = template.list(filelist);
                var html= template.HTML(title, list, 
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"</p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
	    var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(error){
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Page not found');
    }
});


var hostname = '127.0.0.1';
var port = 3000;

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


/*
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/
