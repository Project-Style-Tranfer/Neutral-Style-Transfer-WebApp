// ===============================
// Classic Node Packages & APIS
// ===============================
global.express = require("express");
global.expressLayouts = require("express-ejs-layouts");
global.app = express();
global.path = require('path');
global.google = require('googleapis');
global.bodyParser = require('body-parser');
global.mongoose = require('mongoose');
global.nodemailer = require('nodemailer');
global.bcrypt = require('bcryptjs');
global.passport = require("passport");
global.LocalStrategy  = require("passport-local").Strategy;
global.googleStrategy = require('passport-google-oauth2').Strategy;
global.flash = require('connect-flash');
global.otpGenerator = require('otp-generator')

// =======================
// Environment Variables
// =======================
var PORT = 3000,
    URL  = "mongodb+srv://sulbha:sulbhaPassword@database.p2wjh.mongodb.net/Database?retryWrites=true&w=majority";

// ===========================
// Setting up the view engine
// ===========================
app.use(expressLayouts);
app.set("view engine","ejs");

// ======================
// All the static files
// ======================
app.use(express.static(__dirname + '/public'));

// =============================
// Body Parser for JSON format
// =============================
app.use(bodyParser.urlencoded({extended: true}));

// ====================
// Importing Models
// ====================
var User = require("./models/users");

// ==============================
// Connection setup to database
// ==============================
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("mongodb is connected");
}).catch((error)=>{
    console.log("mongodb not connected");
    console.log(error);
});

// =================================
// Set admin variables for mailing
// =================================
global.adminMailid = "";
global.adminPass = "";

// =============
// Nodemailer
// =============
global.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: adminMailid,
        pass: adminPass
    }
});

// ===========================
// For prompting the messages 
// ===========================
app.use(flash());

// ===========================
// PASSPORT CONFIGURATION
// ===========================
app.use(require("express-session")({
    secret: "Blah",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =============================
// Setting up the user globally
// =============================
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


// ===========
// Home Route
// ===========
app.get('/', function(req, res){
    // res.sendFile(path.join(__dirname+'/index.html'));
    res.render('index');
});

// ================
// Sign up route
// ================
app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/signup', function(req, res){
    var newUser = new User({username: req.body.username, email: req.body.email, firstLogin: "True"});
    var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    var mailOptions = {
        from: adminMailid,
        to: req.body.email,
        subject: "Verification OTP",
        text: 'Use this OTP: ' + otp + ' to setup your account.'
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            req.flash("error", "Some error occurred, please try again!");
            res.redirect('/signup');
        } else {
            User.register(newUser, req.body.password, function(err, user){
                if(err) {
                    console.log(err);
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    res.redirect("/signin");
                }
            });
        }
        // console.log('Message sent: %s', info.messageId);
    });
});

// =============
// Signin Route
// =============
app.get('/signin', function(req, res){
    res.render('signin');
});

app.post('/signin', function(req, res){
    console.log(req.body);
});

// ==============
// Logout Route
// ==============
app.get('/logout', function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
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
});