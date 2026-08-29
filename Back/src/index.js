const exp = require('express')
const http = require('http')
const { Server } = require('socket.io')
const Database = require('better-sqlite3')
const path = require('path')
const { error } = require('console')

let cur_online = 0;

const app = exp()
app.use(exp.json());

const server = http.createServer(app)
const io = new Server(server, {
    cors: {origin: '*'}
});

const db = new Database('messages.db')

db.exec(/*sql*/`
    create table if not exists messages (
        id integer primary key autoincrement,
        username text not null,
        avatar text not null,
        msg text not null
    )
`);

const newMsg = db.prepare(/*sql*/`insert into messages (username, avatar, msg) values (?, ?, ?)`);
const getHis = db.prepare(/*sql*/`select username, avatar, msg from messages order by id asc limit 50`)

io.on('connection', (socket) => {
    console.log('Hello, ', socket.id);
    cur_online++;
    io.emit('online', cur_online);
    io.emit('change_room', true);
    
    const history = getHis.all();
    socket.emit('history', history);

    socket.on('send_message', (data) => {
        const { username, avatar, msg } = data

        if (!msg || !msg.trim()) return;

        newMsg.run(username, avatar, msg);

        io.emit('new_message', { username, avatar, msg });
    });
    socket.on('clear_history', () => {
        db.exec(/*sql*/`delete from messages`)
        io.emit('msgs_clean');
    })

    socket.on('disconnect', () => {
        console.log('Goodbye, ', socket.id);
        cur_online = Math.max(0, cur_online-1);
        io.emit('online', cur_online);
        io.emit('change_room', false);
    });
});

app.get('/his', (req, res) => {
    res.json(getHis.all())
});

app.post('/send', (req, res) => {
    const { username, avatar, msg } = req.body;

    if (!msg || !msg.trim())
        return res.status(400).json({error: "Empty Message"})

    newMsg.run(username || 'Something', avatar || '', msg);
    io.emit('new_message', { username: username || 'Something', avatar: avatar || '', msg });

    res.status(200).json({status: 'Cool'});
});


server.listen(616, () => {
    console.log('Start');
});