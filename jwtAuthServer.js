require("dotenv").config()
const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
app.use(express.json()) 

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
        //console.log(33333, person)
        if (err) return res.sendStatus(403)
        const accessToken = generateAccesstoken({ name:decode.name })
        res.json({ accessToken:accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/login', (req, res) => {
    //auntetikasi user login name:pass
    const person = {name:req.body.username}

    const accessToken = generateAccesstoken(person)
    const refreshToken = jwt.sign(person, process.env.REFRESH_TOKEN_SECRET)
    console.log(444, refreshToken)
    refreshTokens.push(refreshToken)
    console.log(55, refreshTokens)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccesstoken(person) {
    return  jwt.sign(person, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

app.listen(5000, () => [
    console.log(`App listening on: https//localhost:5000`)
])