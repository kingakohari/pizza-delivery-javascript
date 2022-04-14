const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const fs = require('fs');


app.use(fileUpload());
app.use(express.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
})

// Order view
app.get('/order-view', (req, res) => {
	res.sendFile(path.join(`${__dirname}/../frontend/orderview.html`));
})

app.get('/order-view/orders', (req, res) => {
    const ordersList = fs.readdirSync(__dirname + '/data/orders/');
    let ordersArray = [];

    ordersList.forEach(order => {
        const orderData = fs.readFileSync(__dirname + '/data/orders/' + order);
        ordersArray.push(JSON.parse(orderData));
    });
    
    res.send(ordersArray);
})

app.get('/order-view/orders/open', (req, res) => {
    const ordersList = fs.readdirSync(__dirname + '/data/orders/');
    let openOrdersArray = [];

    ordersList.forEach(order => {
        const orderData = JSON.parse(fs.readFileSync(__dirname + '/data/orders/' + order));
        if (orderData.status === "open") {
            openOrdersArray.push(orderData)
        }
    })

    res.send(openOrdersArray);
})

app.get('/order-view/orders/closed', (req, res) => {
    const ordersList = fs.readdirSync(__dirname + '/data/orders/');
    let closedOrdersArray = [];

    ordersList.forEach(order => {
        const orderData = JSON.parse(fs.readFileSync(__dirname + '/data/orders/' + order));
        if (orderData.status === "closed") {
            closedOrdersArray.push(orderData)
        }
    })

    res.send(closedOrdersArray);
})

app.use('/order', express.static(`${__dirname}/../backend/data/orders`));

app.get('/valami', (req, res) => {
    res.sendFile(path.join(`${__dirname}/../backend/data/orders/orders.json`));
}) 

app.use('/public', express.static(`${__dirname}/../frontend/public`));

app.get('/pizza-list.json', (req, res) => {
    res.sendFile(path.join(`${__dirname}/../backend/data/pizza-list.json`));
})

app.use('/images', express.static(`${__dirname}/../backend/data/img`));


app.post('/', (req, res) => {
    const idData = fs.readFileSync(__dirname + '/data/id.json', error => {
        if (error) console.log(error);
    });
    id = parseInt(idData);

    const file = JSON.stringify(req.body, null, 2);
    const uploadPath = __dirname + '/../backend/data/orders/' + `order${id}.json`;
    
    fs.writeFileSync(uploadPath, file, err => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    })
    res.send({response: "a rendelés beérkezett!"});

    id++;

    fs.writeFile(__dirname + '/data/id.json', id.toString(), error => {
        if (error) console.log(error)
    });
})

app.post('/adminMode/', (req, res) => {
    const adminModePizzaList = req.body;
    const uploadPath = __dirname + '/../backend/data/pizza-list.json';

    fs.writeFileSync(uploadPath, JSON.stringify(adminModePizzaList, null, 4), err => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    });
    res.send({response: "pizza list has been updated!"});
})

app.post('/adminMode/image/', (req, res) => {
    const uploadPath = __dirname + '/../backend/data/img/';
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send({response: "no images were uploaded!"});
    }
    const uploadedImagesArray = Object.keys(req.files);
    let uploadedPicture;

    uploadedImagesArray.forEach(imageKey => {
        uploadedPicture = req.files[imageKey];
        uploadedPicture.mv(uploadPath + uploadedPicture.name + '.png', err => {
            if (err) {
                return res.status(500).send(err);
            }
        });
    });
    res.send({response: "pizza images has been updated!"});
})

app.delete('/delete', (req, res) => {
    const removePictureName = req.body.name;
    const removePath = __dirname + '/../backend/data/img/' + removePictureName + '.png';

    if (fs.existsSync(removePath)) {
        fs.unlinkSync(removePath, err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
        })
    }

    return res.status(200).send({response: `${removePictureName}.png has been deleted succesfully!`});
})

const port = 9000;
const ipAddress = `127.0.0.1:${port}`;

app.listen(port, () => {
	console.log(ipAddress);
})