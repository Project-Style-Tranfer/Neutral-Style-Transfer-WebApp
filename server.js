// ===============================
// Classic Node Packages & APIS
// ===============================
global.express = require("express");
global.app = express();
global.path = require('path');
global.google = require('googleapis');
global.bodyParser = require('body-parser');

// =======================
// Environment Variables
// =======================
var PORT = 3000;

// ===========================
// Setting up the view engine
// ===========================
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

// ===========
// Home Route
// ===========
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

// ================
// Sign up route
// ================
app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/signup', function(req, res){
    console.log(req.body);
});

// =============
// Login Route
// =============
app.get('/login', function(req, res){
    res.render('signin');
});

app.post('/login', function(req, res){
    console.log(req.body);
});

// =============
// Forgot Password Route
// =============
app.get('/forgot_password', function(req, res){
    res.render('forgot_password');
});

app.post('/forgot_password', function(req, res){
    console.log(req.body);
});

// ====================================
// PORT listener, server is running :)
// ====================================
app.listen(PORT, function(){
    console.log("The server is running...");
})