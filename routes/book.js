'use strict';
var db = require("../coSqlite3");
var html = require('../myModule').html;
var regEx = require('../myModule').regEx;

exports.init = function* (req, res) {
    try {
        yield db.execSQL('CREATE TABLE books(bID varchar(30) PRIMARY KEY, bName varchar(30), bPub varchar(30), ' + 
            'bDate varchar(10), bAuthor varchar(20), bMem varchar(30), bCnt integer, bCnt_now integer)');
        yield db.execSQL('CREATE TABLE readers(rID varchar(8) PRIMARY KEY, rName varchar(10), rSex varchar(1), ' + 
            'rDept varchar(10), rGrade integer, borrowed integer)');
        yield db.execSQL('CREATE TABLE borrow(rID varchar(8), bID varchar(30), time varchar(20), ' + 
            'FOREIGN KEY(bID) REFERENCES books(bID), FOREIGN KEY(rID) REFERENCES readers(rID))');
    }
    catch (error) {
        return "<html><body><div id='result' style='display:none'>1</div>" + error + "</body></html>";
    }
    return html.success;
}

exports.add = function* (req, res) {
    let bID = req.body.bID;
    let bName = req.body.bName;
    let bPub = req.body.bPub;
    let bDate = req.body.bDate;
    let bAuthor = req.body.bAuthor;
    let bMem = req.body.bMem;
    let bCnt = req.body.bCnt;

    let rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
    if (rows.length != 0) {
        return "<html><body><div id='result' style='display:none'>1</div>该书已经存在</body></html>";
    }

    if (bID.length > 0 && bID.length <= 30) {
        if (bName.length > 0 && bName.length <= 30) {
            if (bPub.length > 0 && bPub.length <= 30) {
                if (bDate.match(regEx.date)) {
                    if (bAuthor.length > 0 && bAuthor.length <= 30) {
                        if (bMem.length > 0 && bMem.length <= 30) {
                            if (bCnt.match(regEx.posInt)) {
                                yield db.execSQL('INSERT INTO books(bID,bName,bPub,bDate,bAuthor,bMem,bCnt,bCnt_now) VALUES(?,?,?,?,?,?,?,?)', 
                                    [bID, bName, bPub, bDate, bAuthor, bMem, bCnt, bCnt]);
                                return html.success;
                            }
                        }
                    }
                }
            }
        }    
    }

    return html.inputError;
}

exports.increase = function* (req, res) {
    let bID = req.body.bID;
    let bCnt = req.body.bCnt;

    if (bID.length > 0 && bID.length <= 30) {
        if (bCnt.match(regEx.posInt)) {

            let rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
            if (rows.length == 0) {
                return "<html><body><div id='result' style='display:none'>1</div>该书不存在</body></html>";
            }
        
            if (bID.length > 0 && bID.length <= 30) {
                if (bCnt.match(regEx.posInt)) {    
                    yield db.execSQL('UPDATE books SET bCnt = bCnt + ?, bCnt_now = bCnt_now + ? WHERE bID = ?', [bCnt, bCnt, bID]);
                    return html.success;
                }
            }
        }
    }
    return html.inputError;
}

// 减少/删除书籍
exports.decrease = function* (req, res) {
    let bID = req.body.bID;
    let bCnt = req.body.bCnt;

    if (bID.length > 0 && bID.length <= 30) {
        if (bCnt.match(regEx.posInt)) {

            let rows = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
            if (rows.length == 0) {
                return "<html><body><div id='result' style='display:none'>1</div>该书不存在</body></html>";
            }

            rows = yield db.execSQL('SELECT bCnt_now FROM books WHERE bID = ?', [bID]);
            if (rows[0].bCnt < bCnt)
            return "<html><body><div id='result' style='display:none'>2</div>减少的数量大于该书目前在库数量</body></html>'";
            else if (rows[0].bCnt == bCnt) {
                yield db.execSQL('DELETE FROM books WHERE bID = ?', [bID]);
                return html.success;
            }
            else {
                if (bID.length > 0 && bID.length <= 30) {
                    if (bCnt.match(regEx.posInt)) {
                        yield db.execSQL('UPDATE books SET bCnt = bCnt - ?, bCnt_now = bCnt_now - ? WHERE bID = ?', [bCnt, bCnt, bID]);
                        return html.success;
                    }
                }
            }
        }
    }
    return "<html><body><div id='result' style='display:none'>3</div>提交的参数有误</body></html>";
}

exports.modify = function* (req, res) {
    let bID = req.body.bID;
    let bName = req.body.bName;
    let bPub = req.body.bPub;
    let bDate = req.body.bDate;
    let bAuthor = req.body.bAuthor;
    let bMem = req.body.bMem;

    if (bID.length > 0 && bID.length <= 30) {
        if (bName.length > 0 && bName.length <= 30) {
            if (bPub.length <= 30) {
                if (bDate == '' || bDate.match(regEx.date)) {
                    if (bAuthor.length <= 30) {
                        if (bMem.length <= 30) {

                            let result = yield db.execSQL('SELECT * FROM books WHERE bID = ?', [bID]);
                            if (result[0].length == 0) {
                                return "<html><body><div id='result' style='display:none'>1</div>该书不存在</body></html>";
                            }

                            let sql = 'UPDATE books SET bName = ?, ';
                            let varlist = [bName];

                            if (bPub != '') {
                                sql += 'bPub = ?, ';
                                varlist.push(bPub);
                            }
                            if (bDate != '') {
                                sql += 'bDate = ?, ';
                                varlist.push(bDate);
                            }
                            if (bAuthor != '') {
                                sql += 'bAuthor = ?, ';
                                varlist.push(bAuthor);
                            }
                            if (bMem != '') {
                                sql += 'bMem = ?, ';
                                varlist.push(bMem);
                            }
                            sql = sql.substring(0, sql.length - 2);
                            sql += ' WHERE bID = ?';
                            varlist.push(bID);
                            
                            yield db.execSQL(sql, varlist);
                            return html.success;
                        }
                    }
                }
            }
        }
    }
        
    return html.inputError;
}

exports.search = function* (req, res) {
    let bID = req.body.bID;
    let bName = req.body.bName;
    let bPub = req.body.bPub;
    let bDate0 = req.body.bDate0;
    let bDate1 = req.body.bDate1;
    let bAuthor = req.body.bAuthor;
    let bMem = req.body.bMem;

    let sql = 'SELECT * FROM books WHERE bID LIKE ? AND bName LIKE ? AND bPub LIKE ? AND bAuthor LIKE ? AND bMem LIKE ?';
    let varlist = ['%'+bID+'%', '%'+bName+'%', '%'+bPub+'%', '%'+bAuthor+'%', '%'+bMem+'%'];
    
    if (bDate0 != '') {
        sql += " AND bDate >= ?";
        varlist.push(bDate0);
    }
    if (bDate1 != '') {
        sql += " AND bDate <= ?";
        varlist.push(bDate1);
    }

    let rows = yield db.execSQL(sql, varlist);
    
    let table = "<table border=1 id='result'>";
    for (let row of rows) {
        table += '<tr><td>' + row.bID + '</td><td>' + row.bName + '</td><td>' + row.bCnt + '</td><td>' + row.bCnt_now + '</td><td>' 
        + row.bPub + '</td><td>' + row.bDate + '</td><td>' + row.bAuthor + '</td><td>' + row.bMem + '</td></tr>';
    }
    table += '</table>';

    return html.begin + table + html.end;
}