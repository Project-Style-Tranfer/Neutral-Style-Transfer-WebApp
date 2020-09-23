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

// =============
// Login Route
// =============
app.get('/login', function(req, res){
    res.render('signin');
});

app.post('/login', function(req, res){
    console.log(req.body);
});

// ====================================
// PORT listener, server is running :)
// ====================================
app.listen(PORT, function(){
    console.log("The server is running...");
})