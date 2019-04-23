# trial_task1
This is a simple fullstack application allowing users to convert video files into audio, audio files into video and to join (concatenate) two audio files into one.

## Preparation

### Install node
`sudo apt-get update`  
`sudo apt-get install curl`  
`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`  
`sudo apt-get install nodejs`

### Install npm
`sudo apt-get install npm`

### Install forever
`sudo npm install forever --global`

### Install react
`sudo npm install -g create-react-app`

### Install dependencies
`cd backend && npm install`  
`cd ../client && npm install`

## Running the app

### Run server
`cd backend/ && forever start server.js`

### Run client
`cd client/ && npm start`
