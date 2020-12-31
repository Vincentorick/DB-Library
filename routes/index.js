'use strict';
const app = require('../WebApp');
const reader = require('./reader');
const book = require('./book');

app.route('/init', 'post', book.init);
app.route('/addBook', 'post', book.add);
app.route('/increase', 'post', book.increase);
app.route('/decrease', 'post', book.decrease);
app.route('/modifyBook', 'post', book.modify);
app.route('/searchBook', 'post', book.search);

app.route('/addReader', 'post', reader.add);
app.route('/deleteReader', 'post', reader.delete);
app.route('/modifyReader', 'post', reader.modify);
app.route('/searchReader', 'post', reader.search);
app.route('/showBorrowed', 'post', reader.showBorrowed);
app.route('/borrowBook', 'post', reader.borrowBook);
app.route('/returnBook', 'post', reader.returnBook);
app.route('/showOverdue', 'post', reader.showOverdue);