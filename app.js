const express = require('express');
const cors = require('cors');

const MESSAGE_STATUS_PENDING = 'MESSAGE_STATUS_PENDING';
const MESSAGE_STATUS_SENT = 'MESSAGE_STATUS_SENT';
const MESSAGE_STATUS_FAIL = 'MESSAGE_STATUS_FAIL';

const server = express();
server.use(cors()); // подключение middleware
server.use(express.json());

let messages = [];
// removed: 

const count = 3;
server.get('/api/messages', (req, res) => {
    const { lastSeenId } = req.query;
    console.log(messages.length);
    setTimeout(() => {
        // если ничего не видел - то отдаём последние три
        if (lastSeenId === '') {
            res.send(messages.slice(messages.length - count).filter(o => !o.removed));
            return;
        }

        // если что видел - ищем, что он видел
        const index = messages.findIndex(o => o.id === lastSeenId);
        if (index === -1) {
            res.send(messages.slice(messages.length - count).filter(o => !o.removed));
            return;
        }

        res.send(messages.slice(index + 1, index + 1 + count).filter(o => !o.removed));
    }, 1000);

    // res.status(400).send();
});

server.post('/api/messages', (req, res) => {
    const item = req.body;
    item.status = MESSAGE_STATUS_SENT;
    item.removed = false;

    const existing = messages.find(o => o.id === item.id);
    if (existing === undefined) {
        messages = [...messages, item];
        res.status(201).send();
        return;
    }

    messages = messages.map(o => o.id === item.id ? item : o);
    res.status(204).send();
});

server.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    const existing = messages.find(o => o.id === id);
    if (existing === undefined) {
        res.status(400).send();
        return;
    }

    messages = messages.map(o => o.id === id ? {...o, removed: true} : o);
    res.status(204).send();
});

server.listen(process.env.PORT || 9999);