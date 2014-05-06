shutdown
========

Sequenced shutdown events for graceful shutdown in Node.

```
npm install shutdown
```

Add your shutdown handlers:
```
/* Add a mongo shutdown handler at priority 10 */
shutdown.addHandler('mongo', 10, function(callback) {
  /* Quit your mongo connections here */
  callback();
});

/* Add a mongo shutdown handler at priority 9 */
shutdown.addHandler('redis', 9, function(callback) {
  /* Quit your redis connections here */
  callback();
});
```

When you want to shutdown:
```
/* Mongo shutdown handlers will be called first, then redis handlers next, etc */
shutdown.shutdownGracefully();

```

If you want to provide an exit code for the process
```
shutdown.shutdownGracefully(1);
```


Licence
=======

The MIT License (MIT)

Copyright (c) 2014 Troupe Technology Limited.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.