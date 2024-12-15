<h1>Blog Chat </h1>
<p>
  Users can Register as a new user, login with new credentials and create a Post
  Unauthenticated users can view posts but if they try to create a post they will be directed to the Login page

  The purpose is to demo a Secure Branch andan  Insecure Branch against XSS attacks, SQl Injection Attacks and Sensitive Data Exposure
  
</p>
<h2> Security Used</h2>
- Bcrypt <br>
    - Salting <br>
    - hashing Password <br>
- Content Security Policy <br>
- Login Limitation attempts <br>
- Secured Cookies <br>
- Checks on Password / Login credentials <br>
- Generic Error message notes <br>
- Adding ? to const queries in app.js file to change it from accessible SQL query  -  VALUES (?,?,?)`;


<h2>How to Install project</h2>
Packages installed

Packages need to install

node js - node -v nodemon - npm install -g nodemon package.json file - npm init package.json file locked -npm install lodash Npm install - npm install Express Apps - npm install expres

   "bcrypt": "^5.1.1", <br>
    "body-parser": "^1.20.3",<br>
    "dotenv": "^16.4.7",<br>
    "ejs": "^3.1.10",<br>
    "express": "^4.21.1",<br>
    "express-rate-limit": "^7.4.1",<br>
    "express-session": "^1.18.1",<br>
    "lodash": "^4.17.21",<br>
    "sqlite3": "^5.1.7"<br>

<h2>Run the Project</h2>
Open project in Visual Studio code

- In Github, click the green button code
- HTTPS section, copy the link or open via GitHub Desktop
- Open terminal page <br>
- 1st Terminal input: nodemon app <br>
- This will start the project <br>
- Go into your browser of choice and in the HTTPs area add  http://localhost:3000/

  <h2> Database Connection</h2>
  Make sure that you have "sqlite3": "^5.1.7" installed
Blog Chat Post table

![image](https://github.com/user-attachments/assets/35673cd0-d737-492a-af9b-a54e689c9597)

New Registered User table

![image](https://github.com/user-attachments/assets/be33e794-5087-4515-a8d2-22583e09ade2)


  

<h2> Site layout</h2>
<h3>Index/Home</h3>
User can nav to other pages or access media links

![home_index](https://github.com/user-attachments/assets/4f266b4c-3f30-4a12-ae4d-b3da8213c893)

<h3>Blog Chat Page</h3>
Logged in User can create Blog Chat Post or access media links
Unauthenticated can view but must be logged in

![image](https://github.com/user-attachments/assets/f307d257-380a-44ad-8865-b17951451dbf)

<h3>Register Page</h3>
Users can create login credentials 

![image](https://github.com/user-attachments/assets/0b13cf11-5439-4329-9888-839ca55cd940)




<h3>Login Page</h3>
User can login with newly created credentials

![image](https://github.com/user-attachments/assets/5c9850ed-a7c6-45f5-b995-a2c26cb73a4d)


  <h2>Credit</h2>
HOLLY DOWLING : X21150117 - x21150117@student.ncirl.ie
