const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const { MongoClient} = require('mongodb')

app.use(express.static("./frontend"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.use(cookieParser())



app.get('/join', (req, res)=>{
    res.render('sign_up.ejs')
})
app.get('/login', (req, res)=>{
    res.render('login.ejs')
})


let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.tezgpjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
    console.log('DB')
    db = client.db('web')
    app.listen(8080,()=>{
        console.log('http://localhost:8080 running~')
    })

}).catch((err)=>{
    console.log(err)
  })


app.get('/', async(req, res)=>{
    const Username = req.cookies.Username || null
    res.render('/index',{Username:Username})
})





app.get('/userinfo', async(req, res)=>{
    let result = await db.collection('user').find().toArray()
    result.forEach(e => {
        console.log(e.userId)
    });
    res.render('login.ejs', {users : result})    
})


app.post('/join', async(req, res)=>{
    let username = await db.collection('user').findOne({name:req.body.name})
    let userId = await db.collection('user').findOne({userId:req.body.id})
    if(username || userId){
        if(userId){
            res.send('<script>alert("이미 있는 아이디입니다."); location.href="/join";</script>')
        }else{
            res.send('<script>alert("이미 있는 이름입니다."); location.href="/login";</script>')
        }
    }else{
        console.log(req.body)
        db.collection('user').insertOne({
            userId : req.body.id,
            pw : req.body.pw,
            name : req.body.name
        })
        res.redirect('/login')
    }
}) 




app.post('/login', async(req, res) => {
    let userinfo = await db.collection('user').findOne({ userId: req.body.id })
    if (!userinfo) {
        res.send('<script>alert("아이디 또는 비밀번호가 틀렸습니다."); location.href="/login";</script>')
    }else{
        if(userinfo.pw == req.body.pw){
            res.cookie('Username', userinfo.name, { maxAge: 90000*50, path: '/' })
            res.send('<script>alert("로그인 성공"); location.href="/index";</script>')
            console.log('Cookies:',req.cookies)
        }else{
            res.send('<script>alert("아이디 또는 비밀번호가 틀렸습니다."); location.href="/login";</script>')
        }
    }
})



app.post('/write', (req, res)=>{
    console.log(req.body)
    db.collection('test').insertOne({
        title : req.body.title,
        content : req.body.detail,
        name : Username
       
    })
    res.redirect('/index')

})


app.get('/view_list', async(req, res)=>{
    let result = await db.collection('test').find().toArray()
    result.forEach(e => {
        console.log(e.title)
    });
    res.render('view_list.ejs', {title : result})    
})



app.get('/index', async(req, res)=>{
    console.log('문자열로')
    let result = await db.collection('test').find().toArray()
    result.forEach(e => {
        console.log(e.title)
    });
    res.render('index.ejs', {test : result})    
})

app.get('/write', async(req, res)=>{
    const Username = req.cookies.Username || null
    res.render('write', { userNickname: userNickname, voteInfo: voteInfo })
})



