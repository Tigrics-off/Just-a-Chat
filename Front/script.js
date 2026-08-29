let username = "Random guy";
let avatar = "img/pinkie.jpg";

const idShow = document.querySelector('.id')

const sendBtn = document.getElementById('send');
const inp = document.getElementById('inp');
const nameinp = document.getElementById('user');
const clearBtn = document.getElementById('clear')

const avatarInput = document.getElementById('avatar-select');
const avatarLabel = document.querySelector('.avatar-label');
const onlineLabel = document.getElementById('online');

const socket = io('http://localhost:616');

socket.on('history', (msgs) => {
    const msgsCont = document.querySelector('.messages');
    msgsCont.innerHTML = '';

    msgs.forEach(msg => {
        renderMsg(msg.username, msg.avatar, msg.msg);
    });
});
socket.on('online', (cur_online) => {
    onlineLabel.innerText = `Chat online - ${cur_online}`;
});
socket.on('new_message', (data) => {
    renderMsg(data.username, data.avatar, data.msg);
});
socket.on('msgs_clean', () => {
    const msgs = document.querySelector('.messages');
    msgs.innerHTML = '';
});
socket.on('change_room', (is_con) => {
    const msgs = document.querySelector('.messages');

    const logging = document.createElement('p');
    logging.classList.add('log');
    logging.innerText = is_con ? "Someone join" : "Someone left";
    msgs.append(logging);

    msgs.scrollTop = msgs.scrollHeight;
});

function renderMsg(User, Avatar, Text)
{
    const msgs = document.querySelector('.messages');

    const msg = document.createElement('div');
    msg.classList.add(User == username ? 'me': 'other')

    const img = document.createElement('img')
    img.src = Avatar;
    img.classList.add('avatar')

    const disName = document.createElement('div');
    disName.innerText = User;
    disName.classList.add('username')

    const text = document.createElement('p');
    text.innerText = Text;
    text.classList.add('text');

    msg.append(img, disName, text);
    msgs.append(msg)
    msgs.scrollTop = msgs.scrollHeight;
}

function addMsg()
{
    if (inp.value.trim() != '')
    {
        socket.emit('send_message', {
            username: username,
            avatar: avatar,
            msg: inp.value
        });
        inp.value = '';

    }
}

nameinp.addEventListener('input', (e) => {
    username = e.target.value || "Something";
    idShow.innerHTML = `Your name - ${username}`
});

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    
    if (file)
    {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            avatar = event.target.result;
            
            avatarLabel.textContent = `Avatar loaded ${file.name}`
        };

        reader.readAsDataURL(file);
    }
});

const chatForm = document.getElementById('chat-form');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addMsg();
});

clearBtn.addEventListener('dblclick', (e) => {
    socket.emit('clear_history');
});