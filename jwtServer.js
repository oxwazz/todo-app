require("dotenv").config()
const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
app.use(express.json()) 

const posts = [
    {
        username: 'ahmad',
        title: 'post1'
    },
    {
        username: 'danial',
        title: 'post2' 
    },
    {
        username: 'ahmad',
        title: 'post3' 
    }
]

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken (req, res, next) {
    const autHeader = req.headers.authorization
    const token = autHeader && autHeader.split(' ')[1]
    if (token==undefined) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) return res.sendStatus(403)
        req.user=decode 
        next()
    })
}

app.listen(4000, () => [
    console.log(`App listening on: https//localhost:4000`)
])