const bcrypt = require("bcrypt")
const express = require("express")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")

//database set up here
const createTables = db.transaction(()=>{
 db.prepare(`
CREATE TABLE IF NOT EXISTS guest(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
    );
    `).run()
})
createTables()




const app = express()


app.set("view engine","ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))
app.use(function(req,res, next){
    res.locals.errors= []
    next()
})
app.get("/",(req,res)=>{
    res.render("homepage")
} )

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/register",(req,res)=>{

    const errors = []
    if(typeof req.body.username !=="string") req.body.username= ""
    if(typeof req.body.password !=="string") req.body.password= ""

    req.body.username = req.body.username.trim()

    if(!req.body.username)errors.push("You must provide a username.")
    if(req.body.username && req.body.username.length<3) errors.push("Username must be atleast three characters")
    if(req.body.username && req.body.username.length>10) errors.push("Username cannot be greater than ten characters")
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers")
    
    if(!req.body.password)errors.push("You must provide a password.")
    if(req.body.password && req.body.password.length<12) errors.push("Password must be atleast twelve characters")
    if(req.body.password && req.body.password.length>30) errors.push("Password cannot be greater than thirty characters")

    if(errors.length){
        return res.render("homepage",{errors})
    }
        // console.log(req.body)
    //Save the user to db
    const salt =bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    const ourStatement =db.prepare("INSERT INTO guest(username, password) VALUES(?,?)")
    ourStatement.run(req.body.username, req.body.password)
    //Log the user by giving cookie

    res.send("ThankYou")
})
app.listen(3000)