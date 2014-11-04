# photos.js

Photoblog in node.js

![Screenshot](https://raw.githubusercontent.com/ni-c/photos.js/master/screen.png)

## Features

### Frontend

- Responsive Design
- Single-page application using AngularJS
- …that also works without Javascript
- Touch enabled
- Scalable vector icons

### Backend

- node.js with Express Framework
- Less and Jade
- Metadata and photos stored in MongoDB with GridFS
- Automatic photo resizing and EXIF parsing
- I18n

## Installation

### node.js

Install node.js: [http://nodejs.org](http://nodejs.org/)

### Imagemagick || Graphicsmagick

Install Imagemagick [http://www.imagemagick.org/](http://www.imagemagick.org/) or Graphicsmagick [http://www.graphicsmagick.org/](http://www.graphicsmagick.org/)

### Bower

Install Bower [http://bower.io](http://bower.io):

```bash
npm install -g bower
```

### Modules

Install bower modules:

```bash
bower install
```

Install node modules:

```bash
npm install
```

## Import JPGs

Import JPGs using the photo-import.js script:

```bash
node photo-import photo1.jpg
```

## Run

````bash
node photos.js
````

## License

MIT License

Copyright (c) 2014 Willi Thiel (ni-c@ni-c.de)

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
