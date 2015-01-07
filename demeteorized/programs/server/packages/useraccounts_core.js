(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var AccountsTemplates, Field, STATE_PAT, ERRORS_PAT, INFO_PAT, INPUT_ICONS_PAT, ObjWithStringValues, TEXTS_PAT, CONFIG_PAT, FIELD_SUB_PAT, FIELD_PAT, AT;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/useraccounts:core/lib/field.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// ---------------------------------------------------------------------------------                                  // 1
                                                                                                                      // 2
// Field object                                                                                                       // 3
                                                                                                                      // 4
// ---------------------------------------------------------------------------------                                  // 5
                                                                                                                      // 6
                                                                                                                      // 7
Field = function(field){                                                                                              // 8
    check(field, FIELD_PAT);                                                                                          // 9
    _.defaults(this, field);                                                                                          // 10
                                                                                                                      // 11
    this.validating = new ReactiveVar(false);                                                                         // 12
    this.status = new ReactiveVar(null);                                                                              // 13
};                                                                                                                    // 14
                                                                                                                      // 15
if (Meteor.isClient)                                                                                                  // 16
    Field.prototype.clearStatus = function(){                                                                         // 17
        return this.status.set(null);                                                                                 // 18
    };                                                                                                                // 19
if (Meteor.isServer)                                                                                                  // 20
    Field.prototype.clearStatus = function(){                                                                         // 21
        // Nothing to do server-side                                                                                  // 22
        return                                                                                                        // 23
    };                                                                                                                // 24
                                                                                                                      // 25
Field.prototype.fixValue = function(value){                                                                           // 26
    if (this.type === "checkbox")                                                                                     // 27
        return !!value;                                                                                               // 28
    if (this.type === "select")                                                                                       // 29
        // TODO: something working...                                                                                 // 30
        return value;                                                                                                 // 31
    if (this.type === "radio")                                                                                        // 32
        // TODO: something working...                                                                                 // 33
        return value;                                                                                                 // 34
    // Possibly applies required transformations to the input value                                                   // 35
    if (this.trim)                                                                                                    // 36
        value = value.trim();                                                                                         // 37
    if (this.lowercase)                                                                                               // 38
        value = value.toLowerCase();                                                                                  // 39
    if (this.uppercase)                                                                                               // 40
        value = value.toUpperCase();                                                                                  // 41
    return value;                                                                                                     // 42
};                                                                                                                    // 43
                                                                                                                      // 44
if (Meteor.isClient)                                                                                                  // 45
    Field.prototype.getDisplayName = function(state){                                                                 // 46
        var dN = this.displayName;                                                                                    // 47
        if (_.isObject(dN))                                                                                           // 48
            dN = dN[state] || dN.default;                                                                             // 49
        if (!dN)                                                                                                      // 50
            dN = this._id;                                                                                            // 51
        return dN;                                                                                                    // 52
    };                                                                                                                // 53
                                                                                                                      // 54
if (Meteor.isClient)                                                                                                  // 55
    Field.prototype.getPlaceholder = function(state){                                                                 // 56
        var placeholder = this.placeholder;                                                                           // 57
        if (_.isObject(placeholder))                                                                                  // 58
            placeholder = placeholder[state] || placeholder.default;                                                  // 59
        if (!placeholder)                                                                                             // 60
            placeholder = this._id;                                                                                   // 61
        return placeholder;                                                                                           // 62
    };                                                                                                                // 63
                                                                                                                      // 64
Field.prototype.getStatus = function(){                                                                               // 65
    return this.status.get();                                                                                         // 66
};                                                                                                                    // 67
                                                                                                                      // 68
if (Meteor.isClient)                                                                                                  // 69
    Field.prototype.getValue = function(tempalteInstance){                                                            // 70
        if (this.type === "checkbox")                                                                                 // 71
            return !!(tempalteInstance.$("#at-field-" + this._id + ":checked").val());                                // 72
        if (this.type === "radio")                                                                                    // 73
            return tempalteInstance.$("[name=at-field-"+ this._id + "]:checked").val();                               // 74
        return tempalteInstance.$("#at-field-" + this._id).val();                                                     // 75
    };                                                                                                                // 76
                                                                                                                      // 77
if (Meteor.isClient)                                                                                                  // 78
    Field.prototype.hasError = function() {                                                                           // 79
        return this.negativeValidation && this.status.get();                                                          // 80
    };                                                                                                                // 81
                                                                                                                      // 82
if (Meteor.isClient)                                                                                                  // 83
    Field.prototype.hasIcon = function(){                                                                             // 84
        if (this.showValidating && this.isValidating())                                                               // 85
            return true;                                                                                              // 86
        if (this.negativeFeedback && this.hasError())                                                                 // 87
            return true;                                                                                              // 88
        if (this.positiveFeedback && this.hasSuccess())                                                               // 89
            return true;                                                                                              // 90
    };                                                                                                                // 91
                                                                                                                      // 92
if (Meteor.isClient)                                                                                                  // 93
    Field.prototype.hasSuccess = function() {                                                                         // 94
        return this.positiveValidation && this.status.get() === false;                                                // 95
    };                                                                                                                // 96
                                                                                                                      // 97
if (Meteor.isClient)                                                                                                  // 98
    Field.prototype.iconClass = function(){                                                                           // 99
        if (this.isValidating())                                                                                      // 100
            return AccountsTemplates.texts.inputIcons["isValidating"];                                                // 101
        if (this.hasError())                                                                                          // 102
            return AccountsTemplates.texts.inputIcons["hasError"];                                                    // 103
        if (this.hasSuccess())                                                                                        // 104
            return AccountsTemplates.texts.inputIcons["hasSuccess"];                                                  // 105
    };                                                                                                                // 106
                                                                                                                      // 107
if (Meteor.isClient)                                                                                                  // 108
    Field.prototype.isValidating = function(){                                                                        // 109
        return this.validating.get();                                                                                 // 110
    };                                                                                                                // 111
                                                                                                                      // 112
if (Meteor.isClient)                                                                                                  // 113
    Field.prototype.setError = function(err){                                                                         // 114
        check(err, Match.OneOf(String, undefined));                                                                   // 115
        console.log(this._id + " setErr: " + err || true);                                                            // 116
        return this.status.set(err || true);                                                                          // 117
    };                                                                                                                // 118
if (Meteor.isServer)                                                                                                  // 119
    Field.prototype.setError = function(err){                                                                         // 120
        // Nothing to do server-side                                                                                  // 121
        return                                                                                                        // 122
    };                                                                                                                // 123
                                                                                                                      // 124
if (Meteor.isClient)                                                                                                  // 125
    Field.prototype.setSuccess = function(){                                                                          // 126
        return this.status.set(false);                                                                                // 127
    };                                                                                                                // 128
if (Meteor.isServer)                                                                                                  // 129
    Field.prototype.setSuccess = function(){                                                                          // 130
        // Nothing to do server-side                                                                                  // 131
        return                                                                                                        // 132
    };                                                                                                                // 133
                                                                                                                      // 134
                                                                                                                      // 135
if (Meteor.isClient)                                                                                                  // 136
    Field.prototype.setValidating = function(state){                                                                  // 137
        check(state, Boolean);                                                                                        // 138
        return this.validating.set(state);                                                                            // 139
    };                                                                                                                // 140
if (Meteor.isServer)                                                                                                  // 141
    Field.prototype.setValidating = function(state){                                                                  // 142
        // Nothing to do server-side                                                                                  // 143
        return                                                                                                        // 144
    };                                                                                                                // 145
                                                                                                                      // 146
if (Meteor.isClient)                                                                                                  // 147
    Field.prototype.setValue = function(tempalteInstance, value){                                                     // 148
        if (this.type === "checkbox") {                                                                               // 149
            tempalteInstance.$("#at-field-" + this._id).prop('checked', true);                                        // 150
            return;                                                                                                   // 151
        }                                                                                                             // 152
        if (this.type === "radio") {                                                                                  // 153
            tempalteInstance.$("[name=at-field-"+ this._id + "]").prop('checked', true);                              // 154
            return;                                                                                                   // 155
        }                                                                                                             // 156
        tempalteInstance.$("#at-field-" + this._id).val(value);                                                       // 157
    };                                                                                                                // 158
                                                                                                                      // 159
Field.prototype.validate = function(value, strict) {                                                                  // 160
    check(value, Match.OneOf(undefined, String, Boolean));                                                            // 161
    this.setValidating(true);                                                                                         // 162
    this.clearStatus();                                                                                               // 163
    if (!value){                                                                                                      // 164
        if (!!strict){                                                                                                // 165
            if (this.required) {                                                                                      // 166
                this.setError("Required Field");                                                                      // 167
                this.setValidating(false);                                                                            // 168
                return "Required Field";                                                                              // 169
            }                                                                                                         // 170
            else {                                                                                                    // 171
                this.setSuccess();                                                                                    // 172
                this.setValidating(false);                                                                            // 173
                return false;                                                                                         // 174
            }                                                                                                         // 175
        }                                                                                                             // 176
        else {                                                                                                        // 177
            this.clearStatus();                                                                                       // 178
            this.setValidating(false);                                                                                // 179
            return null;                                                                                              // 180
        }                                                                                                             // 181
    }                                                                                                                 // 182
    var valueLength = value.length;                                                                                   // 183
    var minLength = this.minLength;                                                                                   // 184
    if (minLength && valueLength < minLength) {                                                                       // 185
        this.setError("Minimum required length: " + minLength);                                                       // 186
        this.setValidating(false);                                                                                    // 187
        return "Minimum required length: " + minLength;                                                               // 188
    }                                                                                                                 // 189
    var maxLength = this.maxLength;                                                                                   // 190
    if (maxLength && valueLength > maxLength) {                                                                       // 191
        this.setError("Maximum allowed length: " + maxLength);                                                        // 192
        this.setValidating(false);                                                                                    // 193
        return "Maximum allowed length: " + maxLength;                                                                // 194
    }                                                                                                                 // 195
    if (this.re && valueLength && !value.match(this.re)) {                                                            // 196
        this.setError(this.errStr);                                                                                   // 197
        this.setValidating(false);                                                                                    // 198
        return this.errStr;                                                                                           // 199
    }                                                                                                                 // 200
    if (this.func && valueLength){                                                                                    // 201
        var result = this.func(value);                                                                                // 202
        return result === true ? this.errStr || true : result;                                                        // 203
    }                                                                                                                 // 204
    this.setSuccess();                                                                                                // 205
    this.setValidating(false);                                                                                        // 206
    return false;                                                                                                     // 207
};                                                                                                                    // 208
                                                                                                                      // 209
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/useraccounts:core/lib/core.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// ---------------------------------------------------------------------------------                                  // 1
                                                                                                                      // 2
// Patterns for methods" parameters                                                                                   // 3
                                                                                                                      // 4
// ---------------------------------------------------------------------------------                                  // 5
                                                                                                                      // 6
STATE_PAT = {                                                                                                         // 7
    changePwd: Match.Optional(String),                                                                                // 8
    enrollAccount: Match.Optional(String),                                                                            // 9
    forgotPwd: Match.Optional(String),                                                                                // 10
    resetPwd: Match.Optional(String),                                                                                 // 11
    signIn: Match.Optional(String),                                                                                   // 12
    signUp: Match.Optional(String),                                                                                   // 13
};                                                                                                                    // 14
                                                                                                                      // 15
ERRORS_PAT = {                                                                                                        // 16
    mustBeLoggedIn: Match.Optional(String),                                                                           // 17
    pwdMismatch: Match.Optional(String),                                                                              // 18
};                                                                                                                    // 19
                                                                                                                      // 20
INFO_PAT = {                                                                                                          // 21
    emailSent: Match.Optional(String),                                                                                // 22
    emailVerified: Match.Optional(String),                                                                            // 23
    pwdReset: Match.Optional(String),                                                                                 // 24
    pwdChanged: Match.Optional(String),                                                                               // 25
    singUpVerifyEmail: Match.Optional(String),                                                                        // 26
};                                                                                                                    // 27
                                                                                                                      // 28
INPUT_ICONS_PAT = {                                                                                                   // 29
    isValidating: Match.Optional(String),                                                                             // 30
    hasError: Match.Optional(String),                                                                                 // 31
    hasSuccess: Match.Optional(String),                                                                               // 32
};                                                                                                                    // 33
                                                                                                                      // 34
ObjWithStringValues = Match.Where(function (x) {                                                                      // 35
    check(x, Object);                                                                                                 // 36
    _.each(_.values(x), function(value){                                                                              // 37
        check(value, String);                                                                                         // 38
    });                                                                                                               // 39
    return true;                                                                                                      // 40
});                                                                                                                   // 41
                                                                                                                      // 42
TEXTS_PAT = {                                                                                                         // 43
    button: Match.Optional(STATE_PAT),                                                                                // 44
    errors: Match.Optional(ERRORS_PAT),                                                                               // 45
    navSignIn: Match.Optional(String),                                                                                // 46
    navSignOut: Match.Optional(String),                                                                               // 47
    info: Match.Optional(INFO_PAT),                                                                                   // 48
    inputIcons: Match.Optional(INPUT_ICONS_PAT),                                                                      // 49
    optionalField: Match.Optional(String),                                                                            // 50
    pwdLink_pre: Match.Optional(String),                                                                              // 51
    pwdLink_link: Match.Optional(String),                                                                             // 52
    pwdLink_suff: Match.Optional(String),                                                                             // 53
    sep: Match.Optional(String),                                                                                      // 54
    signInLink_pre: Match.Optional(String),                                                                           // 55
    signInLink_link: Match.Optional(String),                                                                          // 56
    signInLink_suff: Match.Optional(String),                                                                          // 57
    signUpLink_pre: Match.Optional(String),                                                                           // 58
    signUpLink_link: Match.Optional(String),                                                                          // 59
    signUpLink_suff: Match.Optional(String),                                                                          // 60
    socialAdd: Match.Optional(String),                                                                                // 61
    socialConfigure: Match.Optional(String),                                                                          // 62
    socialIcons: Match.Optional(ObjWithStringValues),                                                                 // 63
    socialRemove: Match.Optional(String),                                                                             // 64
    socialSignIn: Match.Optional(String),                                                                             // 65
    socialSignUp: Match.Optional(String),                                                                             // 66
    socialWith: Match.Optional(String),                                                                               // 67
    termsPreamble: Match.Optional(String),                                                                            // 68
    termsPrivacy: Match.Optional(String),                                                                             // 69
    termsAnd: Match.Optional(String),                                                                                 // 70
    termsTerms: Match.Optional(String),                                                                               // 71
    title: Match.Optional(STATE_PAT),                                                                                 // 72
};                                                                                                                    // 73
                                                                                                                      // 74
// Configuration pattern to be checked with check                                                                     // 75
CONFIG_PAT = {                                                                                                        // 76
    // Behaviour                                                                                                      // 77
    confirmPassword: Match.Optional(Boolean),                                                                         // 78
    defaultState: Match.Optional(String),                                                                             // 79
    enablePasswordChange: Match.Optional(Boolean),                                                                    // 80
    enforceEmailVerification: Match.Optional(Boolean),                                                                // 81
    forbidClientAccountCreation: Match.Optional(Boolean),                                                             // 82
    overrideLoginErrors: Match.Optional(Boolean),                                                                     // 83
    sendVerificationEmail: Match.Optional(Boolean),                                                                   // 84
                                                                                                                      // 85
    // Appearance                                                                                                     // 86
    defaultLayout: Match.Optional(String),                                                                            // 87
    showAddRemoveServices: Match.Optional(Boolean),                                                                   // 88
    showForgotPasswordLink: Match.Optional(Boolean),                                                                  // 89
    showLabels: Match.Optional(Boolean),                                                                              // 90
    showPlaceholders: Match.Optional(Boolean),                                                                        // 91
    hideSignInLink: Match.Optional(Boolean),                                                                          // 92
    hideSignUpLink: Match.Optional(Boolean),                                                                          // 93
                                                                                                                      // 94
    // Client-side Validation                                                                                         // 95
    continuousValidation: Match.Optional(Boolean),                                                                    // 96
    negativeFeedback: Match.Optional(Boolean),                                                                        // 97
    negativeValidation: Match.Optional(Boolean),                                                                      // 98
    positiveValidation: Match.Optional(Boolean),                                                                      // 99
    positiveFeedback: Match.Optional(Boolean),                                                                        // 100
    showValidating: Match.Optional(Boolean),                                                                          // 101
                                                                                                                      // 102
    // Privacy Policy and Terms of Use                                                                                // 103
    privacyUrl: Match.Optional(String),                                                                               // 104
    termsUrl: Match.Optional(String),                                                                                 // 105
                                                                                                                      // 106
    // Redirects                                                                                                      // 107
    homeRoutePath: Match.Optional(String),                                                                            // 108
    redirectTimeout: Match.Optional(Number),                                                                          // 109
                                                                                                                      // 110
    texts: Match.Optional(TEXTS_PAT),                                                                                 // 111
};                                                                                                                    // 112
                                                                                                                      // 113
                                                                                                                      // 114
FIELD_SUB_PAT = {                                                                                                     // 115
    default: Match.Optional(String),                                                                                  // 116
    changePwd: Match.Optional(String),                                                                                // 117
    enrollAccount: Match.Optional(String),                                                                            // 118
    forgotPwd: Match.Optional(String),                                                                                // 119
    resetPwd: Match.Optional(String),                                                                                 // 120
    signIn: Match.Optional(String),                                                                                   // 121
    signUp: Match.Optional(String),                                                                                   // 122
};                                                                                                                    // 123
                                                                                                                      // 124
                                                                                                                      // 125
// Field pattern                                                                                                      // 126
FIELD_PAT = {                                                                                                         // 127
    _id: String,                                                                                                      // 128
    type: String,                                                                                                     // 129
    required: Match.Optional(Boolean),                                                                                // 130
    displayName: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),                                                  // 131
    placeholder: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),                                                  // 132
    select: Match.Optional([{text: String, value: Match.Any}]),                                                       // 133
    minLength: Match.Optional(Match.Integer),                                                                         // 134
    maxLength: Match.Optional(Match.Integer),                                                                         // 135
    re: Match.Optional(RegExp),                                                                                       // 136
    func: Match.Optional(Match.Where(_.isFunction)),                                                                  // 137
    errStr: Match.Optional(String),                                                                                   // 138
                                                                                                                      // 139
    // Client-side Validation                                                                                         // 140
    continuousValidation: Match.Optional(Boolean),                                                                    // 141
    negativeFeedback: Match.Optional(Boolean),                                                                        // 142
    negativeValidation: Match.Optional(Boolean),                                                                      // 143
    positiveValidation: Match.Optional(Boolean),                                                                      // 144
    positiveFeedback: Match.Optional(Boolean),                                                                        // 145
                                                                                                                      // 146
    // Transforms                                                                                                     // 147
    trim: Match.Optional(Boolean),                                                                                    // 148
    lowercase: Match.Optional(Boolean),                                                                               // 149
    uppercase: Match.Optional(Boolean),                                                                               // 150
};                                                                                                                    // 151
                                                                                                                      // 152
// Route configuration pattern to be checked with check                                                               // 153
var ROUTE_PAT = {                                                                                                     // 154
    name: Match.Optional(String),                                                                                     // 155
    path: Match.Optional(String),                                                                                     // 156
    template: Match.Optional(String),                                                                                 // 157
    layoutTemplate: Match.Optional(String),                                                                           // 158
    redirect: Match.Optional(Match.OneOf(String, Match.Where(_.isFunction))),                                         // 159
};                                                                                                                    // 160
                                                                                                                      // 161
                                                                                                                      // 162
// ---------------------------------------------------------------------------------                                  // 163
                                                                                                                      // 164
// AccountsTemplates object                                                                                           // 165
                                                                                                                      // 166
// ---------------------------------------------------------------------------------                                  // 167
                                                                                                                      // 168
                                                                                                                      // 169
                                                                                                                      // 170
// -------------------                                                                                                // 171
// Client/Server stuff                                                                                                // 172
// -------------------                                                                                                // 173
                                                                                                                      // 174
// Constructor                                                                                                        // 175
AT = function() {                                                                                                     // 176
                                                                                                                      // 177
};                                                                                                                    // 178
                                                                                                                      // 179
                                                                                                                      // 180
                                                                                                                      // 181
                                                                                                                      // 182
/*                                                                                                                    // 183
    Each field object is represented by the following properties:                                                     // 184
        _id:         String   (required)  // A unique field"s id / name                                               // 185
        type:        String   (required)  // Displayed input type                                                     // 186
        required:    Boolean  (optional)  // Specifies Whether to fail or not when field is left empty                // 187
        displayName: String   (optional)  // The field"s name to be displayed as a label above the input element      // 188
        placeholder: String   (optional)  // The placeholder text to be displayed inside the input element            // 189
        minLength:   Integer  (optional)  // Possibly specifies the minimum allowed length                            // 190
        maxLength:   Integer  (optional)  // Possibly specifies the maximum allowed length                            // 191
        re:          RegExp   (optional)  // Regular expression for validation                                        // 192
        func:        Function (optional)  // Custom function for validation                                           // 193
        errStr:      String   (optional)  // Error message to be displayed in case re validation fails                // 194
*/                                                                                                                    // 195
                                                                                                                      // 196
                                                                                                                      // 197
                                                                                                                      // 198
/*                                                                                                                    // 199
    Routes configuration can be done by calling AccountsTemplates.configureRoute with the route name and the          // 200
    following options in a separate object. E.g. AccountsTemplates.configureRoute("gingIn", option);                  // 201
        name:           String (optional). A unique route"s name to be passed to iron-router                          // 202
        path:           String (optional). A unique route"s path to be passed to iron-router                          // 203
        template:       String (optional). The name of the template to be rendered                                    // 204
        layoutTemplate: String (optional). The name of the layout to be used                                          // 205
        redirect:       String (optional). The name of the route (or its path) where to redirect after form submit    // 206
*/                                                                                                                    // 207
                                                                                                                      // 208
                                                                                                                      // 209
// Allowed routes along with theirs default configuration values                                                      // 210
AT.prototype.ROUTE_DEFAULT = {                                                                                        // 211
    changePwd:     { name: "atChangePwd",     path: "/change-password"},                                              // 212
    enrollAccount: { name: "atEnrollAccount", path: "/enroll-account"},                                               // 213
    forgotPwd:     { name: "atForgotPwd",     path: "/forgot-password"},                                              // 214
    resetPwd:      { name: "atResetPwd",      path: "/reset-password"},                                               // 215
    signIn:        { name: "atSignIn",        path: "/sign-in"},                                                      // 216
    signUp:        { name: "atSignUp",        path: "/sign-up"},                                                      // 217
    verifyEmail:   { name: "atVerifyEmail",   path: "/verify-email"},                                                 // 218
};                                                                                                                    // 219
                                                                                                                      // 220
                                                                                                                      // 221
                                                                                                                      // 222
// Allowed input types                                                                                                // 223
AT.prototype.INPUT_TYPES = [                                                                                          // 224
    "checkbox",                                                                                                       // 225
    "email",                                                                                                          // 226
    "hidden",                                                                                                         // 227
    "password",                                                                                                       // 228
    "radio",                                                                                                          // 229
    "select",                                                                                                         // 230
    "tel",                                                                                                            // 231
    "text",                                                                                                           // 232
    "url",                                                                                                            // 233
];                                                                                                                    // 234
                                                                                                                      // 235
// Current configuration values                                                                                       // 236
AT.prototype.options = {                                                                                              // 237
    // Appearance                                                                                                     // 238
    //defaultLayout: undefined,                                                                                       // 239
    showAddRemoveServices: false,                                                                                     // 240
    showForgotPasswordLink: false,                                                                                    // 241
    showLabels: true,                                                                                                 // 242
    showPlaceholders: true,                                                                                           // 243
                                                                                                                      // 244
    // Behaviour                                                                                                      // 245
    confirmPassword: true,                                                                                            // 246
    defaultState: "signIn",                                                                                           // 247
    enablePasswordChange: false,                                                                                      // 248
    forbidClientAccountCreation: false,                                                                               // 249
    overrideLoginErrors: true,                                                                                        // 250
    sendVerificationEmail: false,                                                                                     // 251
                                                                                                                      // 252
    // Client-side Validation                                                                                         // 253
    //continuousValidation: false,                                                                                    // 254
    //negativeFeedback: false,                                                                                        // 255
    //negativeValidation: false,                                                                                      // 256
    //positiveValidation: false,                                                                                      // 257
    //positiveFeedback: false,                                                                                        // 258
    //showValidating: false,                                                                                          // 259
                                                                                                                      // 260
    // Privacy Policy and Terms of Use                                                                                // 261
    privacyUrl: undefined,                                                                                            // 262
    termsUrl: undefined,                                                                                              // 263
                                                                                                                      // 264
    // Redirects                                                                                                      // 265
    homeRoutePath: "/",                                                                                               // 266
    redirectTimeout: 2000, // 2 seconds                                                                               // 267
};                                                                                                                    // 268
                                                                                                                      // 269
AT.prototype.SPECIAL_FIELDS = [                                                                                       // 270
    "password_again",                                                                                                 // 271
    "username_and_email",                                                                                             // 272
];                                                                                                                    // 273
                                                                                                                      // 274
// SignIn / SignUp fields                                                                                             // 275
AT.prototype._fields = [                                                                                              // 276
    new Field({                                                                                                       // 277
        _id: "email",                                                                                                 // 278
        type: "email",                                                                                                // 279
        required: true,                                                                                               // 280
        lowercase: true,                                                                                              // 281
        trim: true,                                                                                                   // 282
    }),                                                                                                               // 283
    new Field({                                                                                                       // 284
        _id: "password",                                                                                              // 285
        type: "password",                                                                                             // 286
        required: true,                                                                                               // 287
        minLength: 6,                                                                                                 // 288
        displayName: {                                                                                                // 289
            default: "password",                                                                                      // 290
            changePwd: "newPassword",                                                                                 // 291
            resetPwd: "newPassword",                                                                                  // 292
        },                                                                                                            // 293
        placeholder: {                                                                                                // 294
            default: "password",                                                                                      // 295
            changePwd: "newPassword",                                                                                 // 296
            resetPwd: "newPassword",                                                                                  // 297
        },                                                                                                            // 298
    }),                                                                                                               // 299
];                                                                                                                    // 300
                                                                                                                      // 301
// Configured routes                                                                                                  // 302
AT.prototype.routes = {};                                                                                             // 303
                                                                                                                      // 304
AT.prototype._initialized = false;                                                                                    // 305
                                                                                                                      // 306
// Input type validation                                                                                              // 307
AT.prototype._isValidInputType = function(value) {                                                                    // 308
    return _.indexOf(this.INPUT_TYPES, value) !== -1;                                                                 // 309
};                                                                                                                    // 310
                                                                                                                      // 311
AT.prototype.addField = function(field) {                                                                             // 312
    // Fields can be added only before initialization                                                                 // 313
    if (this._initialized)                                                                                            // 314
        throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");       // 315
    field = _.pick(field, _.keys(FIELD_PAT));                                                                         // 316
    check(field, FIELD_PAT);                                                                                          // 317
    // Checks there"s currently no field called field._id                                                             // 318
    if (_.indexOf(_.pluck(this._fields, "_id"), field._id) !== -1)                                                    // 319
        throw new Error("A field called " + field._id + " already exists!");                                          // 320
    // Validates field.type                                                                                           // 321
    if (!this._isValidInputType(field.type))                                                                          // 322
        throw new Error("field.type is not valid!");                                                                  // 323
    // Checks field.minLength is strictly positive                                                                    // 324
    if (typeof field.minLength !== "undefined" && field.minLength <= 0)                                               // 325
        throw new Error("field.minLength should be greater than zero!");                                              // 326
    // Checks field.maxLength is strictly positive                                                                    // 327
    if (typeof field.maxLength !== "undefined" && field.maxLength <= 0)                                               // 328
        throw new Error("field.maxLength should be greater than zero!");                                              // 329
    // Checks field.maxLength is greater than field.minLength                                                         // 330
    if (typeof field.minLength !== "undefined" && typeof field.minLength !== "undefined" && field.maxLength < field.minLength)
        throw new Error("field.maxLength should be greater than field.maxLength!");                                   // 332
                                                                                                                      // 333
    if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, field._id)))                                             // 334
        this._fields.push(new Field(field));                                                                          // 335
    return this._fields;                                                                                              // 336
};                                                                                                                    // 337
                                                                                                                      // 338
AT.prototype.addFields = function(fields) {                                                                           // 339
    var ok;                                                                                                           // 340
    try { // don"t bother with `typeof` - just access `length` and `catch`                                            // 341
        ok = fields.length > 0 && "0" in Object(fields);                                                              // 342
    } catch (e) {                                                                                                     // 343
        throw new Error("field argument should be an array of valid field objects!");                                 // 344
    }                                                                                                                 // 345
    if (ok) {                                                                                                         // 346
        _.map(fields, function(field){                                                                                // 347
            this.addField(field);                                                                                     // 348
        }, this);                                                                                                     // 349
    } else                                                                                                            // 350
        throw new Error("field argument should be an array of valid field objects!");                                 // 351
    return this._fields;                                                                                              // 352
};                                                                                                                    // 353
                                                                                                                      // 354
AT.prototype.configure = function(config) {                                                                           // 355
    // Configuration options can be set only before initialization                                                    // 356
    if (this._initialized)                                                                                            // 357
        throw new Error("Configuration options must be set before AccountsTemplates.init!");                          // 358
                                                                                                                      // 359
    // Updates the current configuration                                                                              // 360
    check(config, CONFIG_PAT);                                                                                        // 361
    var options = _.omit(config, "texts");                                                                            // 362
    this.options = _.defaults(options, this.options);                                                                 // 363
                                                                                                                      // 364
    if (Meteor.isClient){                                                                                             // 365
        // Possibly sets up client texts...                                                                           // 366
        if (config.texts){                                                                                            // 367
            var texts = config.texts;                                                                                 // 368
            var simpleTexts = _.omit(texts, "button", "errors", "info", "inputIcons", "socialIcons", "title");        // 369
            this.texts = _.defaults(simpleTexts, this.texts);                                                         // 370
                                                                                                                      // 371
            if (texts.button) {                                                                                       // 372
                // Updates the current button object                                                                  // 373
                this.texts.button = _.defaults(texts.button, this.texts.button);                                      // 374
            }                                                                                                         // 375
            if (texts.errors) {                                                                                       // 376
                // Updates the current errors object                                                                  // 377
                this.texts.errors = _.defaults(texts.errors, this.texts.errors);                                      // 378
            }                                                                                                         // 379
            if (texts.info) {                                                                                         // 380
                // Updates the current info object                                                                    // 381
                this.texts.info = _.defaults(texts.info, this.texts.info);                                            // 382
            }                                                                                                         // 383
            if (texts.inputIcons) {                                                                                   // 384
                // Updates the current inputIcons object                                                              // 385
                this.texts.inputIcons = _.defaults(texts.inputIcons, this.texts.inputIcons);                          // 386
            }                                                                                                         // 387
            if (texts.socialIcons) {                                                                                  // 388
                // Updates the current socialIcons object                                                             // 389
                this.texts.socialIcons = _.defaults(texts.socialIcons, this.texts.socialIcons);                       // 390
            }                                                                                                         // 391
            if (texts.title) {                                                                                        // 392
                // Updates the current title object                                                                   // 393
                this.texts.title = _.defaults(texts.title, this.texts.title);                                         // 394
            }                                                                                                         // 395
        }                                                                                                             // 396
    }                                                                                                                 // 397
};                                                                                                                    // 398
                                                                                                                      // 399
AT.prototype.configureRoute = function(route, options) {                                                              // 400
    check(route, String);                                                                                             // 401
    check(options, Match.OneOf(undefined, ROUTE_PAT));                                                                // 402
    // Route Configuration can be done only before initialization                                                     // 403
    if (this._initialized)                                                                                            // 404
        throw new Error("Route Configuration can be done only before AccountsTemplates.init!");                       // 405
    // Only allowed routes can be configured                                                                          // 406
    if (!(route in this.ROUTE_DEFAULT))                                                                               // 407
        throw new Error("Unknown Route!");                                                                            // 408
                                                                                                                      // 409
    // Possibly adds a initial / to the provided path                                                                 // 410
    if (options && options.path && options.path[0] !== "/"){                                                          // 411
        options = _.clone(options);                                                                                   // 412
        options.path = "/" + options.path;                                                                            // 413
    }                                                                                                                 // 414
    // Updates the current configuration                                                                              // 415
    options = _.defaults(options || {}, this.ROUTE_DEFAULT[route]);                                                   // 416
    this.routes[route] = options;                                                                                     // 417
};                                                                                                                    // 418
                                                                                                                      // 419
AT.prototype.hasField = function(fieldId) {                                                                           // 420
    return !!this.getField(fieldId);                                                                                  // 421
};                                                                                                                    // 422
                                                                                                                      // 423
AT.prototype.getField = function(fieldId) {                                                                           // 424
    var field = _.filter(this._fields, function(field){                                                               // 425
        return field._id == fieldId;                                                                                  // 426
    });                                                                                                               // 427
    return (field.length === 1) ? field[0] : undefined;                                                               // 428
};                                                                                                                    // 429
                                                                                                                      // 430
AT.prototype.getFields = function() {                                                                                 // 431
    return this._fields;                                                                                              // 432
};                                                                                                                    // 433
                                                                                                                      // 434
AT.prototype.getFieldIds = function() {                                                                               // 435
    return _.pluck(this._fields, "_id");                                                                              // 436
};                                                                                                                    // 437
                                                                                                                      // 438
AT.prototype.getRouteName = function(route) {                                                                         // 439
    if (route in this.routes)                                                                                         // 440
        return this.routes[route].name;                                                                               // 441
    return null;                                                                                                      // 442
};                                                                                                                    // 443
                                                                                                                      // 444
AT.prototype.getRoutePath = function(route) {                                                                         // 445
    if (route in this.routes)                                                                                         // 446
        return this.routes[route].path;                                                                               // 447
    return "#";                                                                                                       // 448
};                                                                                                                    // 449
                                                                                                                      // 450
AT.prototype.oauthServices = function(){                                                                              // 451
    // Extracts names of available services                                                                           // 452
    var names;                                                                                                        // 453
    if (Meteor.isServer)                                                                                              // 454
        names = (Accounts.oauth && Accounts.oauth.serviceNames()) || [];                                              // 455
    else                                                                                                              // 456
        names = (Accounts.oauth && Accounts.loginServicesConfigured() && Accounts.oauth.serviceNames()) || [];        // 457
    // Extracts names of configured services                                                                          // 458
    var configuredServices = [];                                                                                      // 459
    if (Accounts.loginServiceConfiguration)                                                                           // 460
        configuredServices = _.pluck(Accounts.loginServiceConfiguration.find().fetch(), "service");                   // 461
                                                                                                                      // 462
    // Builds a list of objects containing service name as _id and its configuration status                           // 463
    var services = _.map(names, function(name){                                                                       // 464
        return {                                                                                                      // 465
            _id : name,                                                                                               // 466
            configured: _.contains(configuredServices, name),                                                         // 467
        };                                                                                                            // 468
    });                                                                                                               // 469
                                                                                                                      // 470
    // Checks whether there is a UI to configure services...                                                          // 471
    // XXX: this only works with the accounts-ui package                                                              // 472
    var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";                                      // 473
                                                                                                                      // 474
    // Filters out unconfigured services in case they"re not to be displayed                                          // 475
    if (!showUnconfigured){                                                                                           // 476
        services = _.filter(services, function(service){                                                              // 477
            return service.configured;                                                                                // 478
        });                                                                                                           // 479
    }                                                                                                                 // 480
                                                                                                                      // 481
    // Sorts services by name                                                                                         // 482
    services = _.sortBy(services, function(service){                                                                  // 483
        return service._id;                                                                                           // 484
    });                                                                                                               // 485
                                                                                                                      // 486
    return services;                                                                                                  // 487
};                                                                                                                    // 488
                                                                                                                      // 489
AT.prototype.removeField = function(fieldId) {                                                                        // 490
    // Fields can be removed only before initialization                                                               // 491
    if (this._initialized)                                                                                            // 492
        throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");    // 493
    // Tries to look up the field with given _id                                                                      // 494
    var index = _.indexOf(_.pluck(this._fields, "_id"), fieldId);                                                     // 495
    if (index !== -1)                                                                                                 // 496
        return this._fields.splice(index, 1)[0];                                                                      // 497
    else                                                                                                              // 498
        if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, fieldId)))                                           // 499
            throw new Error("A field called " + fieldId + " does not exist!");                                        // 500
};                                                                                                                    // 501
                                                                                                                      // 502
AT.prototype.setupRoutes = function() {                                                                               // 503
    if (Meteor.isServer){                                                                                             // 504
        // Possibly prints a warning in case showForgotPasswordLink is set to true but the route is not configured    // 505
        if (AccountsTemplates.options.showForgotPasswordLink && !("forgotPwd" in  AccountsTemplates.routes))          // 506
            console.warn("[AccountsTemplates] WARNING: showForgotPasswordLink set to true, but forgotPwd route is not configured!");
        // Configures "reset password" email link                                                                     // 508
        if ("resetPwd" in AccountsTemplates.routes){                                                                  // 509
            var resetPwdPath = AccountsTemplates.routes["resetPwd"].path.substr(1);                                   // 510
            Accounts.urls.resetPassword = function(token){                                                            // 511
                return Meteor.absoluteUrl(resetPwdPath + "/" + token);                                                // 512
            };                                                                                                        // 513
        }                                                                                                             // 514
        // Configures "enroll account" email link                                                                     // 515
        if ("enrollAccount" in AccountsTemplates.routes){                                                             // 516
            var enrollAccountPath = AccountsTemplates.routes["enrollAccount"].path.substr(1);                         // 517
            Accounts.urls.enrollAccount = function(token){                                                            // 518
                return Meteor.absoluteUrl(enrollAccountPath + "/" + token);                                           // 519
            };                                                                                                        // 520
        }                                                                                                             // 521
        // Configures "verify email" email link                                                                       // 522
        if ("verifyEmail" in AccountsTemplates.routes){                                                               // 523
            var verifyEmailPath = AccountsTemplates.routes["verifyEmail"].path.substr(1);                             // 524
            Accounts.urls.verifyEmail = function(token){                                                              // 525
                return Meteor.absoluteUrl(verifyEmailPath + "/" + token);                                             // 526
            };                                                                                                        // 527
        }                                                                                                             // 528
    }                                                                                                                 // 529
                                                                                                                      // 530
    // Determines the default layout to be used in case no specific one is specified for single routes                // 531
    var defaultLayout = AccountsTemplates.options.defaultLayout || Router.options.layoutTemplate;                     // 532
                                                                                                                      // 533
    _.each(AccountsTemplates.routes, function(options, route){                                                        // 534
        if (route === "changePwd" && !AccountsTemplates.options.enablePasswordChange)                                 // 535
            throw new Error("changePwd route configured but enablePasswordChange set to false!");                     // 536
        if (route === "forgotPwd" && !AccountsTemplates.options.showForgotPasswordLink)                               // 537
            throw new Error("forgotPwd route configured but showForgotPasswordLink set to false!");                   // 538
        if (route === "signUp" && AccountsTemplates.options.forbidClientAccountCreation)                              // 539
            throw new Error("signUp route configured but forbidClientAccountCreation set to true!");                  // 540
        // Possibly prints a warning in case the MAIL_URL environment variable was not set                            // 541
        if (Meteor.isServer && route === "forgotPwd" && (!process.env.MAIL_URL || ! Package["email"])){               // 542
            console.warn("[AccountsTemplates] WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!");
        }                                                                                                             // 544
                                                                                                                      // 545
        var name = options.name; // Default provided...                                                               // 546
        var path = options.path; // Default provided...                                                               // 547
        var template = options.template || "fullPageAtForm";                                                          // 548
        var layoutTemplate = options.layoutTemplate || defaultLayout;                                                 // 549
                                                                                                                      // 550
        // Possibly adds token parameter                                                                              // 551
        if (_.contains(["enrollAccount", "resetPwd", "verifyEmail"], route)){                                         // 552
            path += "/:paramToken";                                                                                   // 553
            if (route === "verifyEmail")                                                                              // 554
                Router.route(path, {                                                                                  // 555
                    name: name,                                                                                       // 556
                    template: template,                                                                               // 557
                    layoutTemplate: layoutTemplate,                                                                   // 558
                    onBeforeAction: function() {                                                                      // 559
                        AccountsTemplates.setState(route);                                                            // 560
                        this.next();                                                                                  // 561
                    },                                                                                                // 562
                    onAfterAction: function() {                                                                       // 563
                        AccountsTemplates.setDisabled(true);                                                          // 564
                        var token = this.params.paramToken;                                                           // 565
                        Accounts.verifyEmail(token, function(error){                                                  // 566
                            AccountsTemplates.setDisabled(false);                                                     // 567
                            AccountsTemplates.submitCallback(error, route, function(){                                // 568
                                AccountsTemplates.state.form.set("result", AccountsTemplates.texts.info.emailVerified);
                            });                                                                                       // 570
                        });                                                                                           // 571
                    },                                                                                                // 572
                    onStop: function() {                                                                              // 573
                        AccountsTemplates.clearState();                                                               // 574
                    },                                                                                                // 575
                });                                                                                                   // 576
            else                                                                                                      // 577
                Router.route(path, {                                                                                  // 578
                    name: name,                                                                                       // 579
                    template: template,                                                                               // 580
                    layoutTemplate: layoutTemplate,                                                                   // 581
                    onRun: function() {                                                                               // 582
                        AccountsTemplates.paramToken = this.params.paramToken;                                        // 583
                        this.next();                                                                                  // 584
                    },                                                                                                // 585
                    onBeforeAction: function() {                                                                      // 586
                        AccountsTemplates.setState(route);                                                            // 587
                        this.next();                                                                                  // 588
                    },                                                                                                // 589
                    onStop: function() {                                                                              // 590
                        AccountsTemplates.clearState();                                                               // 591
                        AccountsTemplates.paramToken = null;                                                          // 592
                    }                                                                                                 // 593
                });                                                                                                   // 594
        }                                                                                                             // 595
        else                                                                                                          // 596
            Router.route(path, {                                                                                      // 597
                name: name,                                                                                           // 598
                template: template,                                                                                   // 599
                layoutTemplate: layoutTemplate,                                                                       // 600
                onBeforeAction: function() {                                                                          // 601
                    if(Meteor.user() && route != 'changePwd')                                                         // 602
                        AccountsTemplates.postSubmitRedirect(route);                                                  // 603
                    else                                                                                              // 604
                        AccountsTemplates.setState(route);                                                            // 605
                    this.next();                                                                                      // 606
                },                                                                                                    // 607
                onStop: function() {                                                                                  // 608
                    AccountsTemplates.clearState();                                                                   // 609
                }                                                                                                     // 610
            });                                                                                                       // 611
    });                                                                                                               // 612
};                                                                                                                    // 613
                                                                                                                      // 614
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/useraccounts:core/lib/server.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Initialization                                                                                                     // 1
                                                                                                                      // 2
AT.prototype.init = function() {                                                                                      // 3
    console.warn("[AccountsTemplates] There is no more need to call AccountsTemplates.init()! Simply remove the call ;-)");
};                                                                                                                    // 5
                                                                                                                      // 6
AT.prototype._init = function() {                                                                                     // 7
    if (this._initialized)                                                                                            // 8
        return;                                                                                                       // 9
                                                                                                                      // 10
    // Checks there is at least one account service installed                                                         // 11
    if (!Package["accounts-password"] && (!Accounts.oauth || Accounts.oauth.serviceNames().length === 0))             // 12
        throw Error("AccountsTemplates: You must add at least one account service!");                                 // 13
                                                                                                                      // 14
    // A password field is strictly required                                                                          // 15
    var password = this.getField("password");                                                                         // 16
    if (!password)                                                                                                    // 17
        throw Error("A password field is strictly required!");                                                        // 18
    if (password.type !== "password")                                                                                 // 19
        throw Error("The type of password field should be password!");                                                // 20
                                                                                                                      // 21
    // Then we can have "username" or "email" or even both of them                                                    // 22
    // but at least one of the two is strictly required                                                               // 23
    var username = this.getField("username");                                                                         // 24
    var email = this.getField("email");                                                                               // 25
    if (!username && !email)                                                                                          // 26
        throw Error("At least one field out of username and email is strictly required!");                            // 27
    if (username && !username.required)                                                                               // 28
        throw Error("The username field should be required!");                                                        // 29
    if (email){                                                                                                       // 30
        if (email.type !== "email")                                                                                   // 31
            throw Error("The type of email field should be email!");                                                  // 32
        if (username){                                                                                                // 33
            // username and email                                                                                     // 34
            if (username.type !== "text")                                                                             // 35
                throw Error("The type of username field should be text when email field is present!");                // 36
        }else{                                                                                                        // 37
            // email only                                                                                             // 38
            if (!email.required)                                                                                      // 39
                throw Error("The email field should be required when username is not present!");                      // 40
        }                                                                                                             // 41
    }                                                                                                                 // 42
    else{                                                                                                             // 43
        // username only                                                                                              // 44
        if (username.type !== "text" && username.type !== "tel")                                                      // 45
            throw Error("The type of username field should be text or tel!");                                         // 46
    }                                                                                                                 // 47
                                                                                                                      // 48
    // Possibly publish more user data in order to be able to show add/remove                                         // 49
    // buttons for 3rd-party services                                                                                 // 50
    if (this.options.showAddRemoveServices){                                                                          // 51
        // Publish additional current user info to get the list of registered services                                // 52
        // XXX TODO:                                                                                                  // 53
        // ...adds only user.services.*.id                                                                            // 54
        Meteor.publish("userRegisteredServices", function() {                                                         // 55
            var userId = this.userId;                                                                                 // 56
            return Meteor.users.find(userId, {fields: {services: 1}});                                                // 57
            /*                                                                                                        // 58
            if (userId){                                                                                              // 59
                var user = Meteor.users.findOne(userId);                                                              // 60
                var services_id = _.chain(user.services)                                                              // 61
                    .keys()                                                                                           // 62
                    .reject(function(service){return service === "resume";})                                          // 63
                    .map(function(service){return "services." + service + ".id";})                                    // 64
                    .value();                                                                                         // 65
                var projection = {};                                                                                  // 66
                _.each(services_id, function(key){projection[key] = 1;});                                             // 67
                return Meteor.users.find(userId, {fields: projection});                                               // 68
            }                                                                                                         // 69
            */                                                                                                        // 70
        });                                                                                                           // 71
    }                                                                                                                 // 72
                                                                                                                      // 73
    // Security stuff                                                                                                 // 74
    if (this.options.overrideLoginErrors){                                                                            // 75
        Accounts.validateLoginAttempt(function(attempt){                                                              // 76
            if (attempt.error){                                                                                       // 77
                var reason = attempt.error.reason;                                                                    // 78
                if (reason === "User not found" || reason === "Incorrect password")                                   // 79
                    throw new Meteor.Error(403, "Login forbidden");                                                   // 80
            }                                                                                                         // 81
            return attempt.allowed;                                                                                   // 82
        });                                                                                                           // 83
    }                                                                                                                 // 84
                                                                                                                      // 85
    if (this.options.sendVerificationEmail && this.options.enforceEmailVerification){                                 // 86
        Accounts.validateLoginAttempt(function(info){                                                                 // 87
            if (info.type !== "password" || info.methodName !== "login")                                              // 88
                return true;                                                                                          // 89
            var user = info.user;                                                                                     // 90
            if (!user)                                                                                                // 91
                return true;                                                                                          // 92
            var loginEmail = info.methodArguments[0].user.email;                                                      // 93
            var email = _.filter(user.emails, function(obj){                                                          // 94
                return obj.address === loginEmail;                                                                    // 95
            });                                                                                                       // 96
            if (!email.length || !email[0].verified)                                                                  // 97
                throw new Meteor.Error(401, "Please verify your email first. Check the email and follow the link!" ); // 98
                                                                                                                      // 99
            return true;                                                                                              // 100
        });                                                                                                           // 101
    }                                                                                                                 // 102
                                                                                                                      // 103
    // ------------                                                                                                   // 104
    // Server-Side Routes Definition                                                                                  // 105
    //                                                                                                                // 106
    //   this allows for server-side iron-router usage, like, e.g.                                                    // 107
    //   Router.map(function(){                                                                                       // 108
    //       this.route("fullPageSigninForm", {                                                                       // 109
    //           path: "*",                                                                                           // 110
    //           where: "server"                                                                                      // 111
    //           action: function() {                                                                                 // 112
    //               this.response.statusCode = 404;                                                                  // 113
    //               return this.response.end(Handlebars.templates["404"]());                                         // 114
    //           }                                                                                                    // 115
    //       });                                                                                                      // 116
    //   })                                                                                                           // 117
    // ------------                                                                                                   // 118
    AccountsTemplates.setupRoutes();                                                                                  // 119
                                                                                                                      // 120
    // Marks AccountsTemplates as initialized                                                                         // 121
    this._initialized = true;                                                                                         // 122
};                                                                                                                    // 123
                                                                                                                      // 124
AccountsTemplates = new AT();                                                                                         // 125
                                                                                                                      // 126
                                                                                                                      // 127
// Client side account creation is disabled by default:                                                               // 128
// the methos ATCreateUserServer is used instead!                                                                     // 129
// to actually disable client side account creation use:                                                              // 130
//                                                                                                                    // 131
//    AccountsTemplates.config({                                                                                      // 132
//        forbidClientAccountCreation: true                                                                           // 133
//    });                                                                                                             // 134
Accounts.config({                                                                                                     // 135
    forbidClientAccountCreation: true                                                                                 // 136
});                                                                                                                   // 137
                                                                                                                      // 138
                                                                                                                      // 139
// Initialization                                                                                                     // 140
Meteor.startup(function(){                                                                                            // 141
    AccountsTemplates._init();                                                                                        // 142
});                                                                                                                   // 143
                                                                                                                      // 144
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/useraccounts:core/lib/methods.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
                                                                                                                      // 1
Meteor.methods({                                                                                                      // 2
    ATRemoveService: function(service_name){                                                                          // 3
        var userId = this.userId;                                                                                     // 4
        if (userId){                                                                                                  // 5
            var user = Meteor.users.findOne(userId);                                                                  // 6
            var numServices = _.keys(user.services).length; // including "resume"                                     // 7
            if (numServices === 2)                                                                                    // 8
                throw new Meteor.Error(403, "Cannot remove the only active service!", {});                            // 9
            var unset = {};                                                                                           // 10
            unset["services." + service_name] = "";                                                                   // 11
            Meteor.users.update(userId, {$unset: unset});                                                             // 12
        }                                                                                                             // 13
    },                                                                                                                // 14
});                                                                                                                   // 15
                                                                                                                      // 16
                                                                                                                      // 17
if (Meteor.isServer) {                                                                                                // 18
    Meteor.methods({                                                                                                  // 19
        ATCreateUserServer: function(options){                                                                        // 20
            if (AccountsTemplates.options.forbidClientAccountCreation)                                                // 21
                throw new Meteor.Error(403, "Client side accounts creation is disabled!!!");                          // 22
            // createUser() does more checking.                                                                       // 23
            check(options, Object);                                                                                   // 24
            var allFieldIds = AccountsTemplates.getFieldIds();                                                        // 25
            // Picks-up whitelisted fields for profile                                                                // 26
            var profile = options.profile;                                                                            // 27
            profile = _.pick(profile, allFieldIds);                                                                   // 28
            profile = _.omit(profile, "username", "email", "password");                                               // 29
            // Validates fields" value                                                                                // 30
            var signupInfo = _.clone(profile);                                                                        // 31
            if (options.username)                                                                                     // 32
                signupInfo.username = options.username;                                                               // 33
            if (options.email)                                                                                        // 34
                signupInfo.email = options.email;                                                                     // 35
            if (options.password)                                                                                     // 36
                signupInfo.password = options.password;                                                               // 37
            var validationErrors = {};                                                                                // 38
            var someError = false;                                                                                    // 39
                                                                                                                      // 40
            // Validates fields values                                                                                // 41
            _.each(AccountsTemplates.getFields(), function(field){                                                    // 42
                var fieldId = field._id;                                                                              // 43
                var value = signupInfo[fieldId];                                                                      // 44
                if (fieldId === "password"){                                                                          // 45
                    // Can"t Pick-up password here                                                                    // 46
                    // NOTE: at this stage the password is already encripted,                                         // 47
                    //       so there is no way to validate it!!!                                                     // 48
                    check(value, Object);                                                                             // 49
                    return;                                                                                           // 50
                }                                                                                                     // 51
                var validationErr = field.validate(value, "strict");                                                  // 52
                if (validationErr) {                                                                                  // 53
                    validationErrors[fieldId] = validationErr;                                                        // 54
                    someError = true;                                                                                 // 55
                }                                                                                                     // 56
            });                                                                                                       // 57
            if (someError)                                                                                            // 58
                throw new Meteor.Error(403, "Validation Errors", validationErrors);                                   // 59
                                                                                                                      // 60
            // Possibly removes the profile field                                                                     // 61
            if (_.isEmpty(options.profile))                                                                           // 62
                delete options.profile;                                                                               // 63
                                                                                                                      // 64
            // Create user. result contains id and token.                                                             // 65
            var userId = Accounts.createUser(options);                                                                // 66
            // safety belt. createUser is supposed to throw on error. send 500 error                                  // 67
            // instead of sending a verification email with empty userid.                                             // 68
            if (! userId)                                                                                             // 69
                throw new Error("createUser failed to insert new user");                                              // 70
                                                                                                                      // 71
            // Send a email address verification email in case the context permits it                                 // 72
            // and the specific configuration flag was set to true                                                    // 73
            if (options.email && AccountsTemplates.options.sendVerificationEmail)                                     // 74
                Accounts.sendVerificationEmail(userId, options.email);                                                // 75
        },                                                                                                            // 76
    });                                                                                                               // 77
}                                                                                                                     // 78
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['useraccounts:core'] = {
  AccountsTemplates: AccountsTemplates
};

})();

//# sourceMappingURL=useraccounts_core.js.map
