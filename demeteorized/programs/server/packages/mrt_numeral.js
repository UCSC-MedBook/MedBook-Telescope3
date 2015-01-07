(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var numeral;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/mrt:numeral/numeral/numeral.js                                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
/*!                                                                                                                // 1
 * numeral.js                                                                                                      // 2
 * version : 1.5.3                                                                                                 // 3
 * author : Adam Draper                                                                                            // 4
 * license : MIT                                                                                                   // 5
 * http://adamwdraper.github.com/Numeral-js/                                                                       // 6
 */                                                                                                                // 7
                                                                                                                   // 8
(function () {                                                                                                     // 9
                                                                                                                   // 10
    /************************************                                                                          // 11
        Constants                                                                                                  // 12
    ************************************/                                                                          // 13
                                                                                                                   // 14
    var numeral,                                                                                                   // 15
        VERSION = '1.5.3',                                                                                         // 16
        // internal storage for language config files                                                              // 17
        languages = {},                                                                                            // 18
        currentLanguage = 'en',                                                                                    // 19
        zeroFormat = null,                                                                                         // 20
        defaultFormat = '0,0',                                                                                     // 21
        // check for nodeJS                                                                                        // 22
        hasModule = (typeof module !== 'undefined' && module.exports);                                             // 23
                                                                                                                   // 24
                                                                                                                   // 25
    /************************************                                                                          // 26
        Constructors                                                                                               // 27
    ************************************/                                                                          // 28
                                                                                                                   // 29
                                                                                                                   // 30
    // Numeral prototype object                                                                                    // 31
    function Numeral (number) {                                                                                    // 32
        this._value = number;                                                                                      // 33
    }                                                                                                              // 34
                                                                                                                   // 35
    /**                                                                                                            // 36
     * Implementation of toFixed() that treats floats more like decimals                                           // 37
     *                                                                                                             // 38
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present                               // 39
     * problems for accounting- and finance-related software.                                                      // 40
     */                                                                                                            // 41
    function toFixed (value, precision, roundingFunction, optionals) {                                             // 42
        var power = Math.pow(10, precision),                                                                       // 43
            optionalsRegExp,                                                                                       // 44
            output;                                                                                                // 45
                                                                                                                   // 46
        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);                     // 47
        // Multiply up by precision, round accurately, then divide and use native toFixed():                       // 48
        output = (roundingFunction(value * power) / power).toFixed(precision);                                     // 49
                                                                                                                   // 50
        if (optionals) {                                                                                           // 51
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');                                               // 52
            output = output.replace(optionalsRegExp, '');                                                          // 53
        }                                                                                                          // 54
                                                                                                                   // 55
        return output;                                                                                             // 56
    }                                                                                                              // 57
                                                                                                                   // 58
    /************************************                                                                          // 59
        Formatting                                                                                                 // 60
    ************************************/                                                                          // 61
                                                                                                                   // 62
    // determine what type of formatting we need to do                                                             // 63
    function formatNumeral (n, format, roundingFunction) {                                                         // 64
        var output;                                                                                                // 65
                                                                                                                   // 66
        // figure out what kind of format we are dealing with                                                      // 67
        if (format.indexOf('$') > -1) { // currency!!!!!                                                           // 68
            output = formatCurrency(n, format, roundingFunction);                                                  // 69
        } else if (format.indexOf('%') > -1) { // percentage                                                       // 70
            output = formatPercentage(n, format, roundingFunction);                                                // 71
        } else if (format.indexOf(':') > -1) { // time                                                             // 72
            output = formatTime(n, format);                                                                        // 73
        } else { // plain ol' numbers or bytes                                                                     // 74
            output = formatNumber(n._value, format, roundingFunction);                                             // 75
        }                                                                                                          // 76
                                                                                                                   // 77
        // return string                                                                                           // 78
        return output;                                                                                             // 79
    }                                                                                                              // 80
                                                                                                                   // 81
    // revert to number                                                                                            // 82
    function unformatNumeral (n, string) {                                                                         // 83
        var stringOriginal = string,                                                                               // 84
            thousandRegExp,                                                                                        // 85
            millionRegExp,                                                                                         // 86
            billionRegExp,                                                                                         // 87
            trillionRegExp,                                                                                        // 88
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],                                           // 89
            bytesMultiplier = false,                                                                               // 90
            power;                                                                                                 // 91
                                                                                                                   // 92
        if (string.indexOf(':') > -1) {                                                                            // 93
            n._value = unformatTime(string);                                                                       // 94
        } else {                                                                                                   // 95
            if (string === zeroFormat) {                                                                           // 96
                n._value = 0;                                                                                      // 97
            } else {                                                                                               // 98
                if (languages[currentLanguage].delimiters.decimal !== '.') {                                       // 99
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.'); // 100
                }                                                                                                  // 101
                                                                                                                   // 102
                // see if abbreviations are there so that we can multiply to the correct number                    // 103
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                                                                                                                   // 108
                // see if bytes are there so that we can multiply to the correct number                            // 109
                for (power = 0; power <= suffixes.length; power++) {                                               // 110
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;  // 111
                                                                                                                   // 112
                    if (bytesMultiplier) {                                                                         // 113
                        break;                                                                                     // 114
                    }                                                                                              // 115
                }                                                                                                  // 116
                                                                                                                   // 117
                // do some math to create our number                                                               // 118
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));
                                                                                                                   // 120
                // round if we are talking about bytes                                                             // 121
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;                                     // 122
            }                                                                                                      // 123
        }                                                                                                          // 124
        return n._value;                                                                                           // 125
    }                                                                                                              // 126
                                                                                                                   // 127
    function formatCurrency (n, format, roundingFunction) {                                                        // 128
        var symbolIndex = format.indexOf('$'),                                                                     // 129
            openParenIndex = format.indexOf('('),                                                                  // 130
            minusSignIndex = format.indexOf('-'),                                                                  // 131
            space = '',                                                                                            // 132
            spliceIndex,                                                                                           // 133
            output;                                                                                                // 134
                                                                                                                   // 135
        // check for space before or after currency                                                                // 136
        if (format.indexOf(' $') > -1) {                                                                           // 137
            space = ' ';                                                                                           // 138
            format = format.replace(' $', '');                                                                     // 139
        } else if (format.indexOf('$ ') > -1) {                                                                    // 140
            space = ' ';                                                                                           // 141
            format = format.replace('$ ', '');                                                                     // 142
        } else {                                                                                                   // 143
            format = format.replace('$', '');                                                                      // 144
        }                                                                                                          // 145
                                                                                                                   // 146
        // format the number                                                                                       // 147
        output = formatNumber(n._value, format, roundingFunction);                                                 // 148
                                                                                                                   // 149
        // position the symbol                                                                                     // 150
        if (symbolIndex <= 1) {                                                                                    // 151
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {                                            // 152
                output = output.split('');                                                                         // 153
                spliceIndex = 1;                                                                                   // 154
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){                                 // 155
                    // the symbol appears before the "(" or "-"                                                    // 156
                    spliceIndex = 0;                                                                               // 157
                }                                                                                                  // 158
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);                 // 159
                output = output.join('');                                                                          // 160
            } else {                                                                                               // 161
                output = languages[currentLanguage].currency.symbol + space + output;                              // 162
            }                                                                                                      // 163
        } else {                                                                                                   // 164
            if (output.indexOf(')') > -1) {                                                                        // 165
                output = output.split('');                                                                         // 166
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);                          // 167
                output = output.join('');                                                                          // 168
            } else {                                                                                               // 169
                output = output + space + languages[currentLanguage].currency.symbol;                              // 170
            }                                                                                                      // 171
        }                                                                                                          // 172
                                                                                                                   // 173
        return output;                                                                                             // 174
    }                                                                                                              // 175
                                                                                                                   // 176
    function formatPercentage (n, format, roundingFunction) {                                                      // 177
        var space = '',                                                                                            // 178
            output,                                                                                                // 179
            value = n._value * 100;                                                                                // 180
                                                                                                                   // 181
        // check for space before %                                                                                // 182
        if (format.indexOf(' %') > -1) {                                                                           // 183
            space = ' ';                                                                                           // 184
            format = format.replace(' %', '');                                                                     // 185
        } else {                                                                                                   // 186
            format = format.replace('%', '');                                                                      // 187
        }                                                                                                          // 188
                                                                                                                   // 189
        output = formatNumber(value, format, roundingFunction);                                                    // 190
                                                                                                                   // 191
        if (output.indexOf(')') > -1 ) {                                                                           // 192
            output = output.split('');                                                                             // 193
            output.splice(-1, 0, space + '%');                                                                     // 194
            output = output.join('');                                                                              // 195
        } else {                                                                                                   // 196
            output = output + space + '%';                                                                         // 197
        }                                                                                                          // 198
                                                                                                                   // 199
        return output;                                                                                             // 200
    }                                                                                                              // 201
                                                                                                                   // 202
    function formatTime (n) {                                                                                      // 203
        var hours = Math.floor(n._value/60/60),                                                                    // 204
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),                                               // 205
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));                                   // 206
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }                                                                                                              // 208
                                                                                                                   // 209
    function unformatTime (string) {                                                                               // 210
        var timeArray = string.split(':'),                                                                         // 211
            seconds = 0;                                                                                           // 212
        // turn hours and minutes into seconds and add them all up                                                 // 213
        if (timeArray.length === 3) {                                                                              // 214
            // hours                                                                                               // 215
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);                                                  // 216
            // minutes                                                                                             // 217
            seconds = seconds + (Number(timeArray[1]) * 60);                                                       // 218
            // seconds                                                                                             // 219
            seconds = seconds + Number(timeArray[2]);                                                              // 220
        } else if (timeArray.length === 2) {                                                                       // 221
            // minutes                                                                                             // 222
            seconds = seconds + (Number(timeArray[0]) * 60);                                                       // 223
            // seconds                                                                                             // 224
            seconds = seconds + Number(timeArray[1]);                                                              // 225
        }                                                                                                          // 226
        return Number(seconds);                                                                                    // 227
    }                                                                                                              // 228
                                                                                                                   // 229
    function formatNumber (value, format, roundingFunction) {                                                      // 230
        var negP = false,                                                                                          // 231
            signed = false,                                                                                        // 232
            optDec = false,                                                                                        // 233
            abbr = '',                                                                                             // 234
            abbrK = false, // force abbreviation to thousands                                                      // 235
            abbrM = false, // force abbreviation to millions                                                       // 236
            abbrB = false, // force abbreviation to billions                                                       // 237
            abbrT = false, // force abbreviation to trillions                                                      // 238
            abbrForce = false, // force abbreviation                                                               // 239
            bytes = '',                                                                                            // 240
            ord = '',                                                                                              // 241
            abs = Math.abs(value),                                                                                 // 242
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],                                      // 243
            min,                                                                                                   // 244
            max,                                                                                                   // 245
            power,                                                                                                 // 246
            w,                                                                                                     // 247
            precision,                                                                                             // 248
            thousands,                                                                                             // 249
            d = '',                                                                                                // 250
            neg = false;                                                                                           // 251
                                                                                                                   // 252
        // check if number is zero and a custom zero format has been set                                           // 253
        if (value === 0 && zeroFormat !== null) {                                                                  // 254
            return zeroFormat;                                                                                     // 255
        } else {                                                                                                   // 256
            // see if we should use parentheses for negative number or if we should prefix with a sign             // 257
            // if both are present we default to parentheses                                                       // 258
            if (format.indexOf('(') > -1) {                                                                        // 259
                negP = true;                                                                                       // 260
                format = format.slice(1, -1);                                                                      // 261
            } else if (format.indexOf('+') > -1) {                                                                 // 262
                signed = true;                                                                                     // 263
                format = format.replace(/\+/g, '');                                                                // 264
            }                                                                                                      // 265
                                                                                                                   // 266
            // see if abbreviation is wanted                                                                       // 267
            if (format.indexOf('a') > -1) {                                                                        // 268
                // check if abbreviation is specified                                                              // 269
                abbrK = format.indexOf('aK') >= 0;                                                                 // 270
                abbrM = format.indexOf('aM') >= 0;                                                                 // 271
                abbrB = format.indexOf('aB') >= 0;                                                                 // 272
                abbrT = format.indexOf('aT') >= 0;                                                                 // 273
                abbrForce = abbrK || abbrM || abbrB || abbrT;                                                      // 274
                                                                                                                   // 275
                // check for space before abbreviation                                                             // 276
                if (format.indexOf(' a') > -1) {                                                                   // 277
                    abbr = ' ';                                                                                    // 278
                    format = format.replace(' a', '');                                                             // 279
                } else {                                                                                           // 280
                    format = format.replace('a', '');                                                              // 281
                }                                                                                                  // 282
                                                                                                                   // 283
                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {                                              // 284
                    // trillion                                                                                    // 285
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;                               // 286
                    value = value / Math.pow(10, 12);                                                              // 287
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {              // 288
                    // billion                                                                                     // 289
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;                                // 290
                    value = value / Math.pow(10, 9);                                                               // 291
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {               // 292
                    // million                                                                                     // 293
                    abbr = abbr + languages[currentLanguage].abbreviations.million;                                // 294
                    value = value / Math.pow(10, 6);                                                               // 295
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {               // 296
                    // thousand                                                                                    // 297
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;                               // 298
                    value = value / Math.pow(10, 3);                                                               // 299
                }                                                                                                  // 300
            }                                                                                                      // 301
                                                                                                                   // 302
            // see if we are formatting bytes                                                                      // 303
            if (format.indexOf('b') > -1) {                                                                        // 304
                // check for space before                                                                          // 305
                if (format.indexOf(' b') > -1) {                                                                   // 306
                    bytes = ' ';                                                                                   // 307
                    format = format.replace(' b', '');                                                             // 308
                } else {                                                                                           // 309
                    format = format.replace('b', '');                                                              // 310
                }                                                                                                  // 311
                                                                                                                   // 312
                for (power = 0; power <= suffixes.length; power++) {                                               // 313
                    min = Math.pow(1024, power);                                                                   // 314
                    max = Math.pow(1024, power+1);                                                                 // 315
                                                                                                                   // 316
                    if (value >= min && value < max) {                                                             // 317
                        bytes = bytes + suffixes[power];                                                           // 318
                        if (min > 0) {                                                                             // 319
                            value = value / min;                                                                   // 320
                        }                                                                                          // 321
                        break;                                                                                     // 322
                    }                                                                                              // 323
                }                                                                                                  // 324
            }                                                                                                      // 325
                                                                                                                   // 326
            // see if ordinal is wanted                                                                            // 327
            if (format.indexOf('o') > -1) {                                                                        // 328
                // check for space before                                                                          // 329
                if (format.indexOf(' o') > -1) {                                                                   // 330
                    ord = ' ';                                                                                     // 331
                    format = format.replace(' o', '');                                                             // 332
                } else {                                                                                           // 333
                    format = format.replace('o', '');                                                              // 334
                }                                                                                                  // 335
                                                                                                                   // 336
                ord = ord + languages[currentLanguage].ordinal(value);                                             // 337
            }                                                                                                      // 338
                                                                                                                   // 339
            if (format.indexOf('[.]') > -1) {                                                                      // 340
                optDec = true;                                                                                     // 341
                format = format.replace('[.]', '.');                                                               // 342
            }                                                                                                      // 343
                                                                                                                   // 344
            w = value.toString().split('.')[0];                                                                    // 345
            precision = format.split('.')[1];                                                                      // 346
            thousands = format.indexOf(',');                                                                       // 347
                                                                                                                   // 348
            if (precision) {                                                                                       // 349
                if (precision.indexOf('[') > -1) {                                                                 // 350
                    precision = precision.replace(']', '');                                                        // 351
                    precision = precision.split('[');                                                              // 352
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {                                                                                           // 354
                    d = toFixed(value, precision.length, roundingFunction);                                        // 355
                }                                                                                                  // 356
                                                                                                                   // 357
                w = d.split('.')[0];                                                                               // 358
                                                                                                                   // 359
                if (d.split('.')[1].length) {                                                                      // 360
                    d = languages[currentLanguage].delimiters.decimal + d.split('.')[1];                           // 361
                } else {                                                                                           // 362
                    d = '';                                                                                        // 363
                }                                                                                                  // 364
                                                                                                                   // 365
                if (optDec && Number(d.slice(1)) === 0) {                                                          // 366
                    d = '';                                                                                        // 367
                }                                                                                                  // 368
            } else {                                                                                               // 369
                w = toFixed(value, null, roundingFunction);                                                        // 370
            }                                                                                                      // 371
                                                                                                                   // 372
            // format number                                                                                       // 373
            if (w.indexOf('-') > -1) {                                                                             // 374
                w = w.slice(1);                                                                                    // 375
                neg = true;                                                                                        // 376
            }                                                                                                      // 377
                                                                                                                   // 378
            if (thousands > -1) {                                                                                  // 379
                w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[currentLanguage].delimiters.thousands);
            }                                                                                                      // 381
                                                                                                                   // 382
            if (format.indexOf('.') === 0) {                                                                       // 383
                w = '';                                                                                            // 384
            }                                                                                                      // 385
                                                                                                                   // 386
            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }                                                                                                          // 388
    }                                                                                                              // 389
                                                                                                                   // 390
    /************************************                                                                          // 391
        Top Level Functions                                                                                        // 392
    ************************************/                                                                          // 393
                                                                                                                   // 394
    numeral = function (input) {                                                                                   // 395
        if (numeral.isNumeral(input)) {                                                                            // 396
            input = input.value();                                                                                 // 397
        } else if (input === 0 || typeof input === 'undefined') {                                                  // 398
            input = 0;                                                                                             // 399
        } else if (!Number(input)) {                                                                               // 400
            input = numeral.fn.unformat(input);                                                                    // 401
        }                                                                                                          // 402
                                                                                                                   // 403
        return new Numeral(Number(input));                                                                         // 404
    };                                                                                                             // 405
                                                                                                                   // 406
    // version number                                                                                              // 407
    numeral.version = VERSION;                                                                                     // 408
                                                                                                                   // 409
    // compare numeral object                                                                                      // 410
    numeral.isNumeral = function (obj) {                                                                           // 411
        return obj instanceof Numeral;                                                                             // 412
    };                                                                                                             // 413
                                                                                                                   // 414
    // This function will load languages and then set the global language.  If                                     // 415
    // no arguments are passed in, it will simply return the current global                                        // 416
    // language key.                                                                                               // 417
    numeral.language = function (key, values) {                                                                    // 418
        if (!key) {                                                                                                // 419
            return currentLanguage;                                                                                // 420
        }                                                                                                          // 421
                                                                                                                   // 422
        if (key && !values) {                                                                                      // 423
            if(!languages[key]) {                                                                                  // 424
                throw new Error('Unknown language : ' + key);                                                      // 425
            }                                                                                                      // 426
            currentLanguage = key;                                                                                 // 427
        }                                                                                                          // 428
                                                                                                                   // 429
        if (values || !languages[key]) {                                                                           // 430
            loadLanguage(key, values);                                                                             // 431
        }                                                                                                          // 432
                                                                                                                   // 433
        return numeral;                                                                                            // 434
    };                                                                                                             // 435
                                                                                                                   // 436
    // This function provides access to the loaded language data.  If                                              // 437
    // no arguments are passed in, it will simply return the current                                               // 438
    // global language object.                                                                                     // 439
    numeral.languageData = function (key) {                                                                        // 440
        if (!key) {                                                                                                // 441
            return languages[currentLanguage];                                                                     // 442
        }                                                                                                          // 443
                                                                                                                   // 444
        if (!languages[key]) {                                                                                     // 445
            throw new Error('Unknown language : ' + key);                                                          // 446
        }                                                                                                          // 447
                                                                                                                   // 448
        return languages[key];                                                                                     // 449
    };                                                                                                             // 450
                                                                                                                   // 451
    numeral.language('en', {                                                                                       // 452
        delimiters: {                                                                                              // 453
            thousands: ',',                                                                                        // 454
            decimal: '.'                                                                                           // 455
        },                                                                                                         // 456
        abbreviations: {                                                                                           // 457
            thousand: 'k',                                                                                         // 458
            million: 'm',                                                                                          // 459
            billion: 'b',                                                                                          // 460
            trillion: 't'                                                                                          // 461
        },                                                                                                         // 462
        ordinal: function (number) {                                                                               // 463
            var b = number % 10;                                                                                   // 464
            return (~~ (number % 100 / 10) === 1) ? 'th' :                                                         // 465
                (b === 1) ? 'st' :                                                                                 // 466
                (b === 2) ? 'nd' :                                                                                 // 467
                (b === 3) ? 'rd' : 'th';                                                                           // 468
        },                                                                                                         // 469
        currency: {                                                                                                // 470
            symbol: '$'                                                                                            // 471
        }                                                                                                          // 472
    });                                                                                                            // 473
                                                                                                                   // 474
    numeral.zeroFormat = function (format) {                                                                       // 475
        zeroFormat = typeof(format) === 'string' ? format : null;                                                  // 476
    };                                                                                                             // 477
                                                                                                                   // 478
    numeral.defaultFormat = function (format) {                                                                    // 479
        defaultFormat = typeof(format) === 'string' ? format : '0.0';                                              // 480
    };                                                                                                             // 481
                                                                                                                   // 482
    /************************************                                                                          // 483
        Helpers                                                                                                    // 484
    ************************************/                                                                          // 485
                                                                                                                   // 486
    function loadLanguage(key, values) {                                                                           // 487
        languages[key] = values;                                                                                   // 488
    }                                                                                                              // 489
                                                                                                                   // 490
    /************************************                                                                          // 491
        Floating-point helpers                                                                                     // 492
    ************************************/                                                                          // 493
                                                                                                                   // 494
    // The floating-point helper functions and implementation                                                      // 495
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/                                           // 496
                                                                                                                   // 497
    /**                                                                                                            // 498
     * Array.prototype.reduce for browsers that don't support it                                                   // 499
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility // 500
     */                                                                                                            // 501
    if ('function' !== typeof Array.prototype.reduce) {                                                            // 502
        Array.prototype.reduce = function (callback, opt_initialValue) {                                           // 503
            'use strict';                                                                                          // 504
                                                                                                                   // 505
            if (null === this || 'undefined' === typeof this) {                                                    // 506
                // At the moment all modern browsers, that support strict mode, have                               // 507
                // native implementation of Array.prototype.reduce. For instance, IE8                              // 508
                // does not support strict mode, so this check is actually useless.                                // 509
                throw new TypeError('Array.prototype.reduce called on null or undefined');                         // 510
            }                                                                                                      // 511
                                                                                                                   // 512
            if ('function' !== typeof callback) {                                                                  // 513
                throw new TypeError(callback + ' is not a function');                                              // 514
            }                                                                                                      // 515
                                                                                                                   // 516
            var index,                                                                                             // 517
                value,                                                                                             // 518
                length = this.length >>> 0,                                                                        // 519
                isValueSet = false;                                                                                // 520
                                                                                                                   // 521
            if (1 < arguments.length) {                                                                            // 522
                value = opt_initialValue;                                                                          // 523
                isValueSet = true;                                                                                 // 524
            }                                                                                                      // 525
                                                                                                                   // 526
            for (index = 0; length > index; ++index) {                                                             // 527
                if (this.hasOwnProperty(index)) {                                                                  // 528
                    if (isValueSet) {                                                                              // 529
                        value = callback(value, this[index], index, this);                                         // 530
                    } else {                                                                                       // 531
                        value = this[index];                                                                       // 532
                        isValueSet = true;                                                                         // 533
                    }                                                                                              // 534
                }                                                                                                  // 535
            }                                                                                                      // 536
                                                                                                                   // 537
            if (!isValueSet) {                                                                                     // 538
                throw new TypeError('Reduce of empty array with no initial value');                                // 539
            }                                                                                                      // 540
                                                                                                                   // 541
            return value;                                                                                          // 542
        };                                                                                                         // 543
    }                                                                                                              // 544
                                                                                                                   // 545
                                                                                                                   // 546
    /**                                                                                                            // 547
     * Computes the multiplier necessary to make x >= 1,                                                           // 548
     * effectively eliminating miscalculations caused by                                                           // 549
     * finite precision.                                                                                           // 550
     */                                                                                                            // 551
    function multiplier(x) {                                                                                       // 552
        var parts = x.toString().split('.');                                                                       // 553
        if (parts.length < 2) {                                                                                    // 554
            return 1;                                                                                              // 555
        }                                                                                                          // 556
        return Math.pow(10, parts[1].length);                                                                      // 557
    }                                                                                                              // 558
                                                                                                                   // 559
    /**                                                                                                            // 560
     * Given a variable number of arguments, returns the maximum                                                   // 561
     * multiplier that must be used to normalize an operation involving                                            // 562
     * all of them.                                                                                                // 563
     */                                                                                                            // 564
    function correctionFactor() {                                                                                  // 565
        var args = Array.prototype.slice.call(arguments);                                                          // 566
        return args.reduce(function (prev, next) {                                                                 // 567
            var mp = multiplier(prev),                                                                             // 568
                mn = multiplier(next);                                                                             // 569
        return mp > mn ? mp : mn;                                                                                  // 570
        }, -Infinity);                                                                                             // 571
    }                                                                                                              // 572
                                                                                                                   // 573
                                                                                                                   // 574
    /************************************                                                                          // 575
        Numeral Prototype                                                                                          // 576
    ************************************/                                                                          // 577
                                                                                                                   // 578
                                                                                                                   // 579
    numeral.fn = Numeral.prototype = {                                                                             // 580
                                                                                                                   // 581
        clone : function () {                                                                                      // 582
            return numeral(this);                                                                                  // 583
        },                                                                                                         // 584
                                                                                                                   // 585
        format : function (inputString, roundingFunction) {                                                        // 586
            return formatNumeral(this,                                                                             // 587
                  inputString ? inputString : defaultFormat,                                                       // 588
                  (roundingFunction !== undefined) ? roundingFunction : Math.round                                 // 589
              );                                                                                                   // 590
        },                                                                                                         // 591
                                                                                                                   // 592
        unformat : function (inputString) {                                                                        // 593
            if (Object.prototype.toString.call(inputString) === '[object Number]') {                               // 594
                return inputString;                                                                                // 595
            }                                                                                                      // 596
            return unformatNumeral(this, inputString ? inputString : defaultFormat);                               // 597
        },                                                                                                         // 598
                                                                                                                   // 599
        value : function () {                                                                                      // 600
            return this._value;                                                                                    // 601
        },                                                                                                         // 602
                                                                                                                   // 603
        valueOf : function () {                                                                                    // 604
            return this._value;                                                                                    // 605
        },                                                                                                         // 606
                                                                                                                   // 607
        set : function (value) {                                                                                   // 608
            this._value = Number(value);                                                                           // 609
            return this;                                                                                           // 610
        },                                                                                                         // 611
                                                                                                                   // 612
        add : function (value) {                                                                                   // 613
            var corrFactor = correctionFactor.call(null, this._value, value);                                      // 614
            function cback(accum, curr, currI, O) {                                                                // 615
                return accum + corrFactor * curr;                                                                  // 616
            }                                                                                                      // 617
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;                                      // 618
            return this;                                                                                           // 619
        },                                                                                                         // 620
                                                                                                                   // 621
        subtract : function (value) {                                                                              // 622
            var corrFactor = correctionFactor.call(null, this._value, value);                                      // 623
            function cback(accum, curr, currI, O) {                                                                // 624
                return accum - corrFactor * curr;                                                                  // 625
            }                                                                                                      // 626
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;                            // 627
            return this;                                                                                           // 628
        },                                                                                                         // 629
                                                                                                                   // 630
        multiply : function (value) {                                                                              // 631
            function cback(accum, curr, currI, O) {                                                                // 632
                var corrFactor = correctionFactor(accum, curr);                                                    // 633
                return (accum * corrFactor) * (curr * corrFactor) /                                                // 634
                    (corrFactor * corrFactor);                                                                     // 635
            }                                                                                                      // 636
            this._value = [this._value, value].reduce(cback, 1);                                                   // 637
            return this;                                                                                           // 638
        },                                                                                                         // 639
                                                                                                                   // 640
        divide : function (value) {                                                                                // 641
            function cback(accum, curr, currI, O) {                                                                // 642
                var corrFactor = correctionFactor(accum, curr);                                                    // 643
                return (accum * corrFactor) / (curr * corrFactor);                                                 // 644
            }                                                                                                      // 645
            this._value = [this._value, value].reduce(cback);                                                      // 646
            return this;                                                                                           // 647
        },                                                                                                         // 648
                                                                                                                   // 649
        difference : function (value) {                                                                            // 650
            return Math.abs(numeral(this._value).subtract(value).value());                                         // 651
        }                                                                                                          // 652
                                                                                                                   // 653
    };                                                                                                             // 654
                                                                                                                   // 655
    /************************************                                                                          // 656
        Exposing Numeral                                                                                           // 657
    ************************************/                                                                          // 658
                                                                                                                   // 659
    // CommonJS module is defined                                                                                  // 660
    if (hasModule) {                                                                                               // 661
        module.exports = numeral;                                                                                  // 662
    }                                                                                                              // 663
                                                                                                                   // 664
    /*global ender:false */                                                                                        // 665
    if (typeof ender === 'undefined') {                                                                            // 666
        // here, `this` means `window` in the browser, or `global` on the server                                   // 667
        // add `numeral` as a global object via a string identifier,                                               // 668
        // for Closure Compiler 'advanced' mode                                                                    // 669
        this['numeral'] = numeral;                                                                                 // 670
    }                                                                                                              // 671
                                                                                                                   // 672
    /*global define:false */                                                                                       // 673
    if (typeof define === 'function' && define.amd) {                                                              // 674
        define([], function () {                                                                                   // 675
            return numeral;                                                                                        // 676
        });                                                                                                        // 677
    }                                                                                                              // 678
}).call(this);                                                                                                     // 679
                                                                                                                   // 680
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/mrt:numeral/meteor-numeral.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
numeral = this.numeral;                                                                                            // 1
                                                                                                                   // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['mrt:numeral'] = {
  numeral: numeral
};

})();

//# sourceMappingURL=mrt_numeral.js.map
