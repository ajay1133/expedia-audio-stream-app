This repo contains both client & server code for the purpose of demonstration but actual code will 
reside separately for client & server on github for deployment CI/CD & other actions

Client is built in react.js & contains its separate package.json file.
Server is built in node.js with express & contains its separate package.json file

To run the project 
Server: Go to /server, copy the '.env' file & add your AWS configuration, npm i & then run npm start.
Client: Go To /client, npm i & then npm start.

Client connects with the server using websockets. 
The default port for client is 3000 while for server is 4000.

The UI shows a start recording button and user can click on it to start his microphone recording for which he must provide access
Once microphone permission is granted, user can start his audio recording & when he clicks on stop recording the file is transmitted
to backend streamed via websockets and stored in AWS S3 provided in /server/.env file.

User can then view his recordings in the list and play them
A GIT Action CI/CD pipeline file is added for deployment but is yet to be configured, for instance it need the
bucket where build will reside after deployment in AWS S3 & AWS Security Credentials for dev, ts & production environments.

The project demo uses minimal technology set up for demo purposes and doesn't use dynamodb or does user authentication.
All the information is lost one user refreshes the page which could be further improved by storing info in localStorage 
or sqlite database but is outside the scope of this demo and therefore not included.

The client uses 'mic-recorder-to-mp3' npm package to convert audio recording top mp3 and doesn't send data in chunks
but when user clicks on stop recording button, this though can be implemented by using a setInterval function to send data
periodically say after a gap of 30s and later the whole stream can be combined into a singe file and played but
for not complicating the demo this is not yet implemented.
