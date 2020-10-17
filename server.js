// ===============================
// Classic Node Packages & APIS
// ===============================
global.express = require("express");
global.session = require('express-session');
global.expressLayouts = require("express-ejs-layouts");
global.app = express();
global.path = require('path');
global.google = require('googleapis');
global.bodyParser = require('body-parser');
global.mongoose = require('mongoose');
global.nodemailer = require('nodemailer');
global.bcrypt = require('bcrypt');
global.flash = require('connect-flash');
global.otpGenerator = require('otp-generator');
global.dotenv = require('dotenv');

// =======================
// Environment Variables
// =======================
dotenv.config();
var PORT = process.env.PORT,
    URL  = process.env.DATABASEURL;

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

// =========================
// Declaring a Session key
// =========================
app.use(session({secret: 'nirma@123',resave: true,saveUninitialized: true}));

// ====================
// Importing Models
// ====================
var User = require("./models/users");
var Otp = require("./models/otp");
const passport = require("passport");

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
global.adminMailid = process.env.ADMINMAIL;
global.adminPass = process.env.ADMINPASS;

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

// ===========
// Home Route
// ===========
app.get('/', function(req, res){
    // res.sendFile(path.join(__dirname+'/index.html'));
    if(req.session.userid!=null) {
        var usersProjection = { 
            __v: false,
            _id: false,
            password:false
        };
        User.find({username: req.session.userid}, usersProjection, function(err, foundUser){
            if(err) {
                console.log(err);
            } else {
                res.render('index', {
                    loggedin: true,
                    currentUser: foundUser
                });
            }
        })
    } else {
        res.render('index', {
            loggedin: false
        });
    }
});

// ================
// Sign up route
// ================
app.get('/signup', function(req, res){
    if(req.session.userid!=null){
        res.redirect('/');
    } else {
        res.render('signup', {
            loggedin: false
        });
    }
});

app.post('/signup', function(req, res){
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
            Otp.create({email: req.body.email, otp: otp}, function(err, newOtp){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back", {
                        loggedin: false
                    });
                } else {
                    bcrypt.genSalt(10, function(err, salt){
                        if(err) {
                            console.log(err);
                        } else {
                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    var newUser = new User({username: req.body.username, email: req.body.email, password: hash, firstLogin: "True"});
                                    User.create(newUser, function(err, user){
                                        if(err) {
                                            console.log(err);
                                            req.flash("error", err.message);
                                            res.redirect("/signup", {
                                                loggedin: false
                                            });
                                        } else {
                                            console.log(req.body.password);
                                            res.redirect("/signin", {
                                                loggedin: false
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// =============
// Signin Route
// =============
app.get('/signin', function(req, res){
    if(req.session.userid!=null){
        res.redirect('/');
    } else {
        res.render('signin', {
            loggedin: false
        });
    }
});

app.post('/signin', function(req, res){
    // console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({email: email}, function(err, foundUser){
        if(err) {
            req.flash("error", "Some error Occurred!");
            res.redirect('/signin', {
                loggedin: false
            });
        } else {
            if(foundUser) {
                if(foundUser.firstLogin === "True") {
                    Otp.findOne({email: email}, function(err, foundOtp){
                        if(err) {
                            req.flash("error", "Some error Occurred!");
                            res.redirect('/signin');
                        } else {
                            if(foundOtp) {
                                if(foundOtp.otp == password) {
                                    User.updateOne({email: email}, {firstLogin: "False"}, function(err, updated){
                                        if(err) {
                                            req.flash("error", "Some error Occurred!");
                                            res.redirect('/signin');
                                        } else {
                                            req.flash("success", "Successfully logged you in!");
                                            res.redirect("/");
                                        }
                                    })
                                } else {
                                    req.flash("error", "Please enter correct OTP");
                                    res.redirect('/signin');
                                }
                            } else {
                                req.flash("error", "Invalid email!");
                                res.redirect('/signin');
                            }
                        }
                    });
                } else {
                    bcrypt.compare(password, foundUser.password, function(err, isSame){
                        if(err) {
                            console.log(err);
                            req.flash("error", "Some error Occurred!");
                            res.redirect('/signin');
                        } else {
                            if(isSame) {
                                req.session.loggedin = true;
                                req.session.userid = email;
                                req.flash("success", "Successfully logged you in!");
                                res.redirect("/");
                            } else {
                                req.flash("error", "Please enter correct password");
                                res.redirect('/signin');
                            }
                        }
                    });
                }
            } else {
                req.flash("error", "Invalid email, User not found!");
                res.redirect('/signup');
            }
        }
    })
});

// ==============
// Logout Route
// ==============
app.get('/logout', function(req, res){
    req.flash("success", "Logged you out!");
    req.session.destroy();
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