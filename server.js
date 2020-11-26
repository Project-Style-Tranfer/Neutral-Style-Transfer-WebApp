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
global.fs = require('fs');
global.path = require('path');
global.fileUpload = require('express-fileupload');

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

// ============
// Fileupload
// ============
app.use(fileUpload());

// ===================================
// Setting up the flash vars globally
// ===================================
app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ===========
// Home Route
// ===========
app.get('/', function(req, res){
    // res.sendFile(path.join(__dirname+'/index.html'));
    if(req.session.userid!=null) {
        var usersProjection = { 
            __v: false,
            _id: false,
            password: false,
            firstLogin: false
        };
        User.find({email: req.session.userid}, usersProjection, function(err, foundUser){
            if(err) {
                req.flash("error", "Some error occurred!!");
                res.redirect("back");
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
    if(req.session.userid!=null) {
        req.flash("error", "Invalid input!");
        res.redirect("/");
    } else {
        var usersProjection = { 
            __v: false,
            _id: false,
            password:false
        };
        User.find(
            { $or: [ {email: req.body.email}, {username: req.body.username} ] }, usersProjection, function(err, foundUser){
            if(err) {
                req.flash("error", "Some error occurred!!");
                res.redirect("back");
            } else {
                if(foundUser.length>0) {
                    req.flash("error", "User email already registered!");
                    res.redirect("/signup");
                } else {
                    var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
                    var mailOptions = {
                        from: adminMailid,
                        to: req.body.email,
                        subject: "Verification OTP",
                        text: 'Use this OTP: ' + otp + ' to setup your account. Use it as password for first time login.'
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            req.flash("error", "Some error occurred, please try again!");
                            res.redirect('/signup');
                        } else {
                            Otp.create({email: req.body.email, otp: otp}, function(err, newOtp){
                                if(err){
                                    req.flash("error", err.message);
                                    res.redirect('/signup');
                                } else {
                                    bcrypt.genSalt(10, function(err, salt){
                                        if(err) {
                                            req.flash("error", err.message);
                                            res.redirect('/signup');
                                        } else {
                                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                                if(err) {
                                                    req.flash("error", err.message);
                                                    res.redirect('/signup');
                                                } else {
                                                    var newUser = new User({username: req.body.username, email: req.body.email, password: hash, firstLogin: "True"});
                                                    User.create(newUser, function(err, user){
                                                        if(err) {
                                                            req.flash("error", err.message);
                                                            res.redirect("/signup");
                                                        } else {
                                                            res.redirect("/signin");
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
                }
            }
        })
    }
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
                                    Otp.deleteOne({email: email}, function(err, deletedOtp){
                                        if(err) {
                                            req.flash("error", "Some error Occurred!");
                                            res.redirect('/signin');         
                                        } else {
                                            User.updateOne({email: email}, {firstLogin: "False"}, function(err, updated){
                                                if(err) {
                                                    req.flash("error", "Some error Occurred!");
                                                    res.redirect('/signin');
                                                } else {
                                                    req.session.loggedin = true;
                                                    req.session.userid = email;
                                                    req.flash("success", "Successfully logged you in!");
                                                    res.redirect("/");
                                                }
                                            });
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
    req.session.loggedin = false;
    req.session.userid = null;
    res.redirect("/");
});

// =============
// Forgot Password Route
// =============
app.get('/forgot_password', function(req, res){
    if(req.session.userid==null){
        res.render('forgot_password', {
            loggedin: false
        });
    } else {
        req.flash("error", "You have to be logged in to do that!");
        res.redirect('/');
    }
});

app.post('/forgot_password', (req, res) => {
    if(req.session.userid==null){
        var email  = req.body.email;
        var usersProjection = { 
            __v: false,
            _id: false,
            password:false
        };
        User.findOne({email: email}, usersProjection, (err, foundUser) => {
            if(err) {
                req.flash("error", "Some error occurred, please try again later!");
                res.redirect("/forgot_password");
            } else {
                if(foundUser){
                    var password = otpGenerator.generate(8, { upperCase: true, specialChars: true });
                    var mailOptions = {
                        from: adminMailid,
                        to: email,
                        subject: "Password change",
                        text: 'Your new password is: ' + password + ' to login to your account.'
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            req.flash("error", "Some error occurred, please try again!");
                            res.redirect('/forgot_password');
                        } else {
                            bcrypt.genSalt(10, (err, salt) => {
                                if(err) {
                                    req.flash("error", err.message);
                                    res.redirect('/forgot_password');
                                } else {
                                    bcrypt.hash(password, salt, (err, hash) => {
                                        if(err) {
                                            req.flash("error", err.message);
                                            res.redirect('/forgot_password');
                                        } else {
                                            User.updateOne({email: email}, {password: hash}, (err, updateUser) => {
                                                if(err) {
                                                    req.flash("error", err.message);
                                                    res.redirect('/forgot_password');
                                                } else {
                                                    req.flash("success", "Your password is resetted successfully! Please login with your new password.");
                                                    res.redirect("/signin");
                                                }
                                            })
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    req.flash("error", "Invalid email!");
                    res.redirect("/signup");
                }
            }
        })
    } else {
        req.flash("error", "You have to be logged out to do that!");
        res.render('signin', {
            loggedin: true
        });
    }
});

// =======================
// take images for style
// =======================
app.post('/content_image', function(req, res){
    if(req.session.userid!=null) {
        console.log(req.body);
        console.log(req.files);
        // var file_content_image = req.files.content_image;
        // var file_style_image = req.files.style_image;
        // var filename_content = file_content_image.name;
        // var filename_style = file_style_image.name;
        // var name_content = "ContentImage_" + req.session.userid + "_" + Date.now() + "_" + filename_content; 
        // var name_style = "StyleImage_" + req.session.userid + "_" + Date.now() + "_" + filename_style; 
        // file_content_image.mv("./uploads/"+name_content, function(err){
        //     if(err){
        //         req.flash("error", "Some error occured: " + err.message);
        //         res.redirect("back");
        //     } else {
        //         var newContentImage = {
        //             name: "ContentImage_" + req.session.userid + "_" + Date.now(),
        //             img: {
        //                 data: fs.readFileSync(path.join(__dirname + '/uploads/' + name_content)), 
        //                 contentType: 'image/*'
        //             },
        //             author: req.session.userid
        //         };
        //         ContentImage.create(newContentImage, (err, newContentImageCreated) => {
        //             if(err) {
        //                 req.flash("error", "Some error occured");
        //                 res.redirect("back");
        //             } else {
        //                 file_style_image.mv("./uploads/"+name_style, function(err){
        //                     if(err){
        //                         req.flash("error", "Some error occured: " + err.message);
        //                         res.redirect("back");
        //                     } else {
        //                         var newContentImage = {
        //                             name: "StyleImage_" + req.session.userid + "_" + Date.now(),
        //                             img: {
        //                                 data: fs.readFileSync(path.join(__dirname + '/uploads/' + name_style)), 
        //                                 contentType: 'image/*'
        //                             },
        //                             author: req.session.userid
        //                         };
        //                         ContentImage.create(newContentImage, (err, newContentImageCreated) => {
        //                             if(err) {
        //                                 req.flash("error", "Some error occured");
        //                                 res.redirect("back");
        //                             } else { 
        //                                 req.flash("success", "Your photo stored successfully!!");
        //                                 res.redirect("/");
        //                             }
        //                         });
        //                     }
        //                 });
        //             }
        //         });
        //     }
        // });
    } else {
        res.render('signin', {
            loggedin: false
        });
    }
})

// TEMP
// const tf = require('@tensorflow/tfjs');
// mainmodel = require('./public/scripts/model.js');
// app.get('/temp', mainmodel);

// ====================================
// PORT listener, server is running :)
// ====================================
app.listen(PORT, function(){
    console.log("The server is running...");
});