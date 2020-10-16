# Neural-Style-Transfer-Based-Web-App

## Build and Run

### Prerequisites -

1. Install Node.Js and npm
   - Refer [here](https://nodejs.org/en/download/)
2. Database account
   - Refer [here](https://www.mongodb.com/cloud)

### Run Software

1. Clone Repo
   - `$> git clone Project-Style-Tranfer/Neutral-Style-Transfer-WebApp`
2. Change Directory
   - `$> cd Neural-Style-Transfer-Based-Web-App/`
3. Install Dependencies
   - `$> npm install`
4. Mailing Functionality
   - `Allow third party and less secure apps in your gmail account`
5. Environement Variables - cmd line setup
   - `$env:PORT = "3000"`
   - `$env:DATABASEURL = "your_databse_url_generated_from_mongo_cloud"`
   - `$env:ADMINMAIL = "youremail"`
   - `$env:ADMINPASS = "yourpassword"`
6. Start server
   - `$> node server.js`

Go to http://localhost:3000/
