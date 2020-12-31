'use strict';
var db = require("../coSqlite3");
var html = require('../myModule').html;
var regEx = require('../myModule').regEx;

exports.add = function* (req, res) {
    let rID = req.body.rID;
    let rName = req.body.rName;
    let rSex = req.body.rSex;
    let rDept = req.body.rDept;
    let rGrade = req.body.rGrade;

    let rows = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [rID]);
    if (rows.length != 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该证号已经存在</body></html>";
    }

    if (rID.length > 0 && rID.length <= 8) {
        if (rName.length > 0 && rName.length <= 10) {
            if (rSex == '男' || rSex == '女') {
                if (rDept.length > 0 && rDept.length <= 10) {
                    if (rGrade.match(regEx.posInt)) {        
                        yield db.execSQL('INSERT INTO readers(rID, rName, rSex, rDept, rGrade) VALUES(?,?,?,?,?)', 
                            [rID, rName, rSex, rDept, rGrade]);
                        return html.success;
                    }
                }
            }
        }
    }
    return html.inputError;
}

exports.delete = function* (req, res) {
    let rID = req.body.rID;

    let rows = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [rID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该证号不存在</body></html>'";
    }

    if (rows[0].borrowed != 0) {
        return "<html><body><div id='result' style='display:none'>2</div>该读者尚有书籍未归还</body></html>";
    }

    yield db.execSQL('DELETE FROM readers WHERE rID = ?', [rID]);
    return html.success;
}

exports.modify = function* (req, res) {
    let rID = req.body.rID;
    let rName = req.body.rName;
    let rSex = req.body.rSex;
    let rDept = req.body.rDept;
    let rGrade = req.body.rGrade;

    if (rID.length > 0 && rID.length <= 8) {
        if (rName.length <= 10) {
            if (rSex == '' || rSex == '男' || rSex == '女') {
                if (rDept.length <= 10) {
                    if (rGrade == '' || rGrade.match(regEx.posInt)) {

                        let rows = yield db.execSQL('SELECT rID FROM readers WHERE rID=?', [rID]);
                        if (rows.length == 0) {
                            return "<html><body><div id='result' style='display:none'>1</div>该证号不存在</body></html>";
                        }

                        if (rName == '' && rSex == '' && rDept == '' && rGrade == '') {
                            return html.success;
                        }

                        let sql = 'UPDATE readers SET ';
                        let varlist = [];

                        if (rName != '') {
                            sql += 'rName = ?, ';
                            varlist.push(rName);
                        }
                        if (rSex != '') {
                            sql += 'rSex = ?, ';
                            varlist.push(rSex);
                        }
                        if (rDept != '') {
                            sql += 'rDept = ?, ';
                            varlist.push(rDept);
                        }
                        if (rGrade != '') {
                            sql += 'rGrade = ?, ';
                            varlist.push(rGrade);
                        }
                        sql = sql.substring(0, sql.length - 2);
                        sql += ' WHERE rID = ?';
                        varlist.push(rID);
                        
                        yield db.execSQL(sql, varlist);
                        return html.success;
                    }
                }
            }
        }
    }
    return html.inputError;
}

exports.search = function* (req, res) {
    let rID = req.body.rID;
    let rName = req.body.rName;
    let rSex = req.body.rSex;
    let rDept = req.body.rDept;
    let rGrade0 = req.body.rGrade0;
    let rGrade1 = req.body.rGrade1;

    let sql = 'SELECT * FROM readers WHERE rID LIKE ? AND rName LIKE ? AND rSex LIKE ? AND rDept LIKE ? ';
    let varlist = ['%'+rID+'%', '%'+rName+'%', '%'+rSex+'%', '%'+rDept+'%'];
    
    if (rGrade0 != '') {
        sql += 'AND rGrade >= ? ';
        varlist.push(rGrade0);
    }
    if (rGrade1 != '') {
        sql += 'AND rGrade <= ? ';
        varlist.push(rGrade1);
    }

    let rows = yield db.execSQL(sql, varlist);

    let table = "<table border=1 id='result'>";   
    for (let row of rows) {
        table += '<tr><td>' + row.rID + '</td><td>' + row.rName + '</td><td>' + row.rSex + '</td><td>' + row.rDept + '</td><td>' + row.rGrade + '</td></tr>';
    }
    table += '</table>';
    return html.begin + table + html.end;
}

// 查询某个读者未还书籍信息
exports.showBorrowed = function* (req, res) {
    let rID = req.body.rID;
    let rows = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [rID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该证号不存在</body></html>";
    }
    
    let table = "<table border=1 id='result'>";
    let borrows = yield db.execSQL('SELECT * FROM borrow INNER JOIN books WHERE borrow.bID = books.bID AND rID = ?', [rID]);
    for (let borrow of borrows) {
        let borrowTime = new Date(borrow.time);
        let date = new Date(borrowTime.getTime() + 60 * 60 * 24 * 30 * 1000);
        let deadline = date.toISOString().substring(0, 10);
        
        let currentTime = new Date();
        let overdue = '';
        if (date < currentTime)
            overdue = '是';
        else
            overdue = '否';
        table += '<tr><td>' + borrow.bID + '</td>><td>' + borrow.bName + '</td><td>' + borrow.time.substring(0, 10) + '</td>><td>' + deadline + '</td>><td>' + overdue + '</td>></tr>';
    }
    table += '</table>';

    return html.begin + table + html.end;
}

exports.borrowBook = function* (req, res) {
    let rID = req.body.rID;
    let bID = req.body.bID;
    let rows = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [rID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该证号不存在</body></html>";
    }

    rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>2</div>该书号不存在</body></html>";
    }

    rows = yield db.execSQL('SELECT * FROM borrow WHERE bID = ? AND rID = ?', [bID, rID]);
    if (rows.length != 0){
        return "<html><body><div id='result' style='display:none'>4</div>该读者已借阅该书，且未归还</body></html>";
    }

    rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
    if (rows[0].bCnt_now == '0') {
        return "<html><body><div id='result' style='display:none'>5</div>该书已经全部借出</body></html>";
    }

    let date = new Date();
    let currentTime = date.toISOString().substring(0, 10) + ' ' + (date.getHours() < 10? '0' + date.getHours() : date.getHours()) + ':' +
        (date.getMinutes() < 10? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10? '0' + date.getSeconds() : date.getSeconds());
    
    let borrows = yield db.execSQL('SELECT * FROM borrow WHERE rID = ?', [rID]);

    let divider = date.getTime() - 60 * 60 * 24 * 30 * 1000;
    for (let borrow of borrows) {
        let borrowTime = new Date(borrow.time);
        if (borrowTime.getTime() < divider) {
            return "<html><body><div id='result' style='display:none'>3</div>该读者有超期书未还</body></html>";
        }
    }

    yield db.execSQL("INSERT INTO borrow(rID, bID, time) VALUES(?, ?, ?)", [rID, bID, currentTime]);
    yield db.execSQL('UPDATE readers SET borrowed = borrowed + 1 WHERE rID = ?', [rID]);
    yield db.execSQL('UPDATE books SET bCnt_now = bCnt_now - 1 WHERE bID = ?', [bID]);
    return html.success;
}

exports.returnBook = function* (req, res) {
    let rID = req.body.rID;
    let bID = req.body.bID;
    
    let rows = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [rID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该证号不存在</body></html>";
    }

    rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>2</div>该书号不存在</body></html>";
    }

    rows = yield db.execSQL('SELECT * FROM borrow WHERE rID = ? AND bID = ?', [rID, bID]);
    if (rows.length == 0) {
        return "<html><body><div id='result' style='display:none'>3</div>该读者并未借阅该书</body></html>";
    }

    yield db.execSQL('DELETE FROM borrow WHERE rID = ? AND bID = ?', [rID, bID]);
    yield db.execSQL('UPDATE readers SET borrowed = borrowed - 1 WHERE rID = ?', [rID]);
    yield db.execSQL('UPDATE books SET bCnt_now = bCnt_now + 1 WHERE bID = ?', [bID]);
    return html.success;
}

// 超期读者列表
exports.showOverdue = function* (req, res) {
    let date = new Date();
    let flag = date.getTime() - 60 * 60 * 24 * 30 * 1000;
    date = new Date(flag);
    flag = date.toISOString().substring(0, 10) + ' ' + (date.getHours() < 10? '0' + date.getHours() : date.getHours()) + ':' +
        (date.getMinutes() < 10? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10? '0' + date.getSeconds() : date.getSeconds());

    let table = "<table border=1 id='result'>";
    let overdueReaders = yield db.execSQL('SELECT DISTINCT(readers.rID) FROM borrow INNER JOIN readers WHERE borrow.rID = readers.rID AND time < ?', [flag]);
    for (let reader of overdueReaders) {
        let info = yield db.execSQL('SELECT * FROM readers WHERE rID = ?', [reader.rID])
        table += '<tr><td>' + info[0].rID + '</td>><td>' + info[0].rName + '</td><td>' + info[0].rSex + '</td><td>' + info[0].rDept + '</td><td>' + info[0].rGrade + '</td></tr>';
    }
    table += '</table>';

    return html.begin + table + html.end;
}