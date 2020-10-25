const MESSAGES = [
    {
        id: 1,
        text: 'Я хочу узнать, как всё устроено',
        owner: 2,
        created: '2018-12-21T19:17:59.353368+00:00'
    },
    {
        id: 2,
        text: 'Разберёмся за 5 минут!',
        owner: 1,
        created: '2018-12-21T19:18:59.353368+00:00'
    },
    {
        id: 3,
        text: 'Чтобы начать инвестировать нужно открыть счёт у любого брокера. Этот счёт подобен тому, который вы открываете в банке для получения дебетовой карты.',
        owner: 1,
        created: '2018-12-21T19:19:59.353368+00:00'
    },
    {
        id: 4,
        text: 'Брокер?',
        owner: 2,
        created: '2018-12-21T19:20:59.353368+00:00'
    },
    {
        id: 5,
        text: 'Это лишь посредник, который имеет прямой доступ к бирже для торговли бумагами.',
        owner: 1,
        created: '2018-12-21T19:21:59.353368+00:00'
    },
    {
        id: 6,
        text: 'А без брокера нельзя?',
        owner: 2,
        created: '2018-12-21T19:22:59.353368+00:00'
    },
    {
        id: 7,
        text: 'Нельзя. Брокеры официально зарегистрированы. Они нужны для того, чтобы предоставлять доступ к рынку ценных бумаг.',
        owner: 1,
        created: '2018-12-21T19:23:59.353368+00:00'
    },
    {
        id: 8,
        text: 'Это опасно? Я чем-то рискую.',
        owner: 2,
        created: '2018-12-21T19:23:59.353368+00:00'
    },
    {
        id: 9,
        text: 'Открывая счёт у брокера, вы ничего не теряете, не становитесь ничего должны и обязаны. А вот покупая ценные бумаги, вы можете как заработать, так и потерять часть вложенного. Ни один брокер не готов предложить безрисковый доход',
        owner: 1,
        created: '2018-12-21T19:23:59.353368+00:00'
    },
]
const USERS = [
    {
        id: 1,
        first_name: 'БКС',
        last_name: 'Мир инвестиций',
        username: 'bks',
        avatar_url: 'https://sun9-58.userapi.com/impf/3rlKgV7eZgd9XkYCuAp5q7sQJZOoUcSDn5oxFA/99fAAcjXveY.jpg?size=0x0&quality=90&proxy=1&sign=908c4a8c35219962471354a4e9c2c88a',
        color: '#7EB3FF'
    },
    {
        id: 2,
        first_name: 'Новый',
        last_name: 'пользователь',
        username: 'user',
        avatar_url: null,
        color: '#FF756B'
    }
]
const SYSTEM = {
    messages: 1,
}
const MY_ID = 2;

class Chat {
    constructor(props) {
        this.props = props;
        this.users = {};
        this.messages = [];
        this.chatLoaded = false;
        this.page = 2;
    }

    scrollDown() {
        const messages = document.getElementsByClassName('messages-container')[0];
        messages.scrollTo(0, document.body.scrollHeight * 99999999);
    }

    formatDate(date) {
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        return `${hours}:${minutes}`
    }

    getAvatar(user) {
        if (user.avatar_url) {
            return `<img class="avatar" src="${user.avatar_url}"/>`
        } else {
            return `<div class="avatar" style="background: ${user.color}">
                        ${user.first_name.slice(0, 1)}${user.last_name.slice(0, 1)}
                    </div>`
        }
    }

    loadLastMessages() {
        fetch(`/api/chats/chat/${CHAT_ID}/messages/?page=` + this.page)
            .then(response => response.json())
            .then(data => {
                data.results.reverse();
                data.results.map(message => {
                    this.createMessage(message, false)
                });

                this.sortMessages();

                if (!data.next) {
                    const loader = document.getElementsByClassName('load-last-messages')[0];
                    if (loader) loader.remove();
                } else {
                    this.page += 1;
                }
            })
            .catch(error => {
                const loader = document.getElementsByClassName('load-last-messages')[0];
                if (loader) loader.remove();
            });
    }

    createMessage(message, scroll) {
        const owner = this.users[message.owner];
        const title = `${owner.first_name} ${owner.last_name}`;
        const text = message.text.replace(/\n/g, '<br>');
        const avatar = this.getAvatar(owner);
        const created = new Date(message.created);
        const time = this.formatDate(created);
        const isMyMessage = String(owner.id) === String(MY_ID);

        const card = Object.assign(document.createElement('div'), {
            className: `animated fadeInUpShort go message${isMyMessage ? ' mine' : ''}`,
            innerHTML: `<div class="avatar-container" data-id="${message.id}">
                                    ${avatar}
                                </div>
                                <div class="body">
                                    <div class="title">
                                        <div class="name">${title}</div>
                                        <div class="time">${time}</div>
                                    </div>
                                    <div class="entry">
                                        <div class="content">
                                            ${text}
                                            <span class="hide">00:00</span >
                                            <span class="time">${time}</span>
                                        </div>
                                    </div>
                                </div>`,
        });

        const exsist = this.messages.filter(msg => msg.id === message.id).length > 0;

        if (!exsist) {
            this.messages.push({
                id: message.id,
                data: message,
                time: (new Date(message.created).getTime()),
                card: card,
                scroll: scroll,
                rendered: false
            });
        }
    }

    updateMessages(scroll) {
        const messages = MESSAGES.slice(0, SYSTEM.messages);
        SYSTEM.messages = SYSTEM.messages + 1;

        messages.map(message => {
            this.createMessage(message, true)
        });

        this.sortMessages();

        if (scroll) {
            this.animation();
            this.scrollDown();

            const lastMessage = document.getElementsByClassName('load-last-messages')[0];

            if (this.messages.length >= 20) {
                lastMessage.style.display = 'flex'
            } else {
                lastMessage.remove();
            }
        }

        const loader = document.getElementsByClassName('loader');
        if (loader.length > 0) loader[0].remove();
    }

    sortMessages() {
        const messages = document.getElementsByClassName('messages-container')[0];

        this.messages = this.messages.sort((a, b) => (a.time - b.time));

        Array.from(Array(this.messages.length).keys()).map(index => {
            const msg = this.messages[index];

            if (!msg.rendered) {
                msg.rendered = true;

                if (this.messages[index - 1]) {
                    this.messages[index - 1].card.after(msg.card)
                } else {
                    messages.firstChild.nextElementSibling.after(msg.card);
                }

                if (msg.scroll) {
                    this.scrollDown();
                }
            }
        });
    }

    loadUsers() {
        USERS.map(user => {
            this.users[user.id] = user
        })

        this.updateMessages(true);
        setInterval(() => {
            this.updateMessages()
        }, this.props.updateDelay);
    }

    sendMessage() {
        const message = document.getElementById('message');
        const sendingText = message.innerText;

        fetch(`/api/chats/chat/${CHAT_ID}/messages/send/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF,
            },
            body: JSON.stringify({
                'text': sendingText,
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                message.innerHTML = "";
                this.updateMessages();
            });
    }

    animation() {
        document.getElementsByTagName('body')[0].classList.add('loaded');
    }

    init() {
        document.getElementsByClassName('input-container')[0].onclick = () => {
            this.scrollDown();
        };

        document.getElementsByClassName('message-send')[0].onclick = (e) => {
            this.sendMessage();
        };

        document.getElementsByClassName('load-last-messages')[0].onclick = (e) => {
            this.loadLastMessages();
        };

        document.getElementById('message').onkeypress = (e) => {
            if ((e.ctrlKey) && (e.key === "Enter")) {
                this.sendMessage();
            }
        };

        this.loadUsers()
    }
}

window.onkeypress = (e) => {
    if (e.key === "Enter") {
        chat.sendMessage();
    }
}
