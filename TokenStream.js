var Token = require("./Tokens");

var ts = function(input){
    "use strict";
    var current = null;
    var keywords = [
        "if",
        "then",
        "else",
        "lambda",
        "true",
        "false"
    ];
    function isKeyword(word){
        return keywords.indexOf(word) >= 0;
    }
    function isDigit(ch){
        return /[0-9]/i.test(ch);
    }
    function isIdStart(ch) {
        return /[a-z$_]/i.test(ch);
    }
    function isId(ch) {
        return isIdStart(ch) || "0123456789".indexOf(ch) >= 0;
    }
    function isOpChar(ch) {
        return "+-*/%=&|<>!".indexOf(ch) >= 0;
    }
    function isPunc(ch) {
        return ",;(){}[]".indexOf(ch) >= 0;
    }
    function isWhitespace(ch) {
        return " \t\n".indexOf(ch) >= 0;
    }
    function readWhile(predicate){
        var str = "";
        while (!input.eof() && predicate(input.peek())){
            str += input.next();
        }
        return str;
    }

    function readNumber(){
        var hasDot = false;
        var number = readWhile(function(ch){
            if (ch === "."){
                if (hasDot) {
                    return false;
                }
                hasDot = true;
                return true;
            }
            return isDigit(ch);
        });
        return { type: Token.NUMBER, value: parseFloat(number)};
    }

    function readIdent() {
        var id = readWhile(isId);
        return {
            type  : isKeyword(id) ? Token.KEYWORD : Token.IDENTIFIER,
            value : id
        };
    }
    function readEscaped(end) {
        var escaped = false,
            str = "";
        input.next();
        while (!input.eof()) {
            var ch = input.next();
            if (escaped) {
                str += ch;
                escaped = false;
            } else if (ch === "\\") {
                escaped = true;
            } else if (ch === end) {
                break;
            } else {
                str += ch;
            }
        }
        return str;
    }
    function readString() {
        return { type: Token.STRING, value: readEscaped('"') };
    }
    function skipComment() {
        readWhile(function(ch){
            return ch !== "\n";
        });
        input.next();
    }
    function readNext(){
        readWhile(isWhitespace);
        if (input.eof()){
            return null;
        }
        var ch = input.peek();
        if (ch === "#"){
            skipComment();
            return readNext();
        }
        if (ch === '"'){
            return readString();
        }
        if (isDigit(ch)){
            return readNumber();
        }
        if (isIdStart(ch)){
            return readIdent();
        }
        if (isPunc(ch)){
            return {type: Token.PUNCTUATION, value: input.next()};
        }
        if (isOpChar(ch)){
            return {type: Token.OPERATOR, value: readWhile(isOpChar)};
        }
        input.croak("Invalid character: " + ch);
    }
    //Exported functions
    function peek() {
        return current || (current = readNext());
    }
    function next() {
        var tok = current;
        current = null;
        return tok || readNext();
    }
    function eof() {
        return peek() === null;
    }
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        croak : input.croak
    };
};

module.exports = ts;
