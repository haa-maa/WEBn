var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateList(filelist){
    var list = `<ul>`;
    var i = 0;
    while(i < filelist.length-1){
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i++
    }
    list = list+`</ul>`;
    return list;
}

function templateHTML(title, list, description, control){
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>WEBn - ${title}</title>
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        <div>
            ${list}
            ${control}
            <div>
                <h2>${title}</h2>
                <p>${description}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


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
            fs.readFile(`data/${title}`, 'utf-8', function(err, description){
                var list = templateList(filelist);
                var template = templateHTML(title, list, description, 
                    `
                    <a href="/create">create</a>
                    <a href="/update?id=${title}">update</a>
                    <form action="delete_process" method="POST">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                    </form>
                    `
                );
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathname === '/create') {
        fs.readdir('./data', function(error, filelist){
            title = 'WEB - create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
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
            response.end(template);
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
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                var list = templateList(filelist);
                var template = templateHTML(title, list, 
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
                response.end(template);
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
