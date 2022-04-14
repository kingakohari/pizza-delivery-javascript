const loadEvent = async () => {
    const rootElement = document.getElementById("root")
    rootElement.insertAdjacentHTML('beforebegin', `<button id="adminMode">Admin mode<br> (staff only)</button>`)
    // Order view
    rootElement.insertAdjacentHTML('beforebegin', `<a target="_blank" href="./order-view"><button id="orderView">Order view<br> (staff only)</button></a>`)

    let content = `<section id="menu">`;
    let pizzaList = "";

    await fetch('pizza-list.json') // pizza-list.json fetchelése, majd a content feltöltése a pizzák nevével és hozzávalóival.
        .then(res => res.json())
        .then(resJson => {
            pizzaList = resJson;
            for (let i = 0; i < pizzaList.length; i++) {
                if (pizzaList[i].isAvailable) {
                    content += `
                        <div class="pizza${i + 1}">
                            <div class="pizzaElement">
                                <img src="${pizzaList[i].image}">
                                <section>
                                    <h1>${pizzaList[i].name}</h1>
                                    <p>${pizzaList[i].ingredients.join(', ')}</p>
                                    <input type="number" id="pizzaInput${i + 1}" min="0" max="99">
                                <button class="pizza" name="pizzaInput${i + 1}">Hozzáadás</button>
                                </section>
                                <img src="${pizzaList[i].image}">
                            </div>                        
                        </div>
                    `;
                };
            };
            content += `
                </section>
                <section id="cart">
                </section>
            `;

        })
        .catch(err => {
            console.log(err.message);
        })
    ;
    
    
    rootElement.insertAdjacentHTML("afterbegin", content);
    cartElement = document.getElementById("cart");
    menuElement = document.getElementById("menu");
    adminButtonElement = document.getElementById("adminMode");


/* ------------------------------ Entering admin mode ---------------------------------------- */


    adminButtonElement.addEventListener('click', event => {
        let adminModeData = `<form id="adminModeContainer">` + pizzaList.map((pizzaElement, index) => {
            return `
                <div class="adminModePizzaCard">
                    <button type="button" class="removePizza"><p>x</p></button> 
                    <label class="adminLabelName">Name:</label>
                    <input class="adminModeName" type="text" name="adminModeName" value="${pizzaElement.name}">
                    <img src="${pizzaElement.image}" name="adminModeImage">
                    <input type="file" name="pizza${index + 1}">
                    <label class="adminLabelName">Ingredients:</label>
                    <textarea>${pizzaElement.ingredients.join(', ')}</textarea>
                    <div class="adminModeDisable">
                        <label class="adminAvailable">Available?</label>
                        <input type="checkbox" name="available" ${(pizzaElement.isAvailable) ? 'checked' : '' }>
                    </div>
                </div>
            `;
        }).join('') + `
                <div class="newPizza">
                    <p>Add new pizza</p>
                    <button id="newPizzaButton" class="adminModeBigPlus">+</button>
                </div>
                <button id="adminModeSaveButton">Save</button>
            </form>
            <div class="saveResponse">Menu has been updated succesfully!</div>`;
            
        rootElement.innerHTML = adminModeData;
            
        const adminModePizzaCardList = document.querySelectorAll('div.adminModePizzaCard');
        adminModePizzaCardList.forEach(pizzaCard => {
            pizzaCard.querySelector('button').addEventListener('click', event => {
                console.dir(event.target.parentElement.parentElement.querySelector('input[type="file"]').name);

                const removeImageFetchSettings = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify({"name": event.target.parentElement.parentElement.querySelector('input[type="file"]').name})
                }

                fetch('/delete', removeImageFetchSettings)
                .then(async data => {
                    if (data.status === 200) {
                        const res = await data.json();
                        console.log(res.response);
                    }
                })
                .catch(err => {
                    console.log(err);
                })

                pizzaCard.remove();
            })
        });

        document.getElementById("newPizzaButton").addEventListener('click', event => {
            event.preventDefault();
            const newPizzaCardElement = document.querySelector('div.newPizza');
            newPizzaCardElement.innerHTML = `
                <label class="adminLabelName">Name:</label>
                <input class="adminModeName" type="text" name="adminModeName" value="">
                <img src="/public/placeholderpizza.png" alt="image" name="adminModeImage">
                <input type="file" name="pizza${document.querySelectorAll('div.adminModePizzaCard').length + 1}">
                <label class="adminLabelName">Ingredients:</label>
                <textarea></textarea>
                <div class="adminModeDisable">
                    <label class="adminAvailable">Available?</label>
                    <input type="checkbox" name="available">
                </div>
            `;
            newPizzaCardElement.classList.add('adminModePizzaCard');
        });

        const adminImageFormData = new FormData();

        const adminModeContainer = document.getElementById('adminModeContainer');
        adminModeContainer.addEventListener('submit', event => {
            event.preventDefault();
            document.querySelector('div.saveResponse').classList.add('show');
            const adminModePizzaList = document.querySelectorAll('.adminModePizzaCard');

            const adminModePizzaListData = [];
            let index = 1;

            adminModePizzaList.forEach(element => {
                adminModePizzaListData.push({
                    "name": element.querySelector('input[name="adminModeName"]').value,
                    "ingredients": element.querySelector('textarea').value.split(', '),
                    "image": "/images/pizza" + index + ".png",
                    "isAvailable": (element.querySelector('input[type="checkbox"]').checked) ? true : false
                })
                index++;
                
                if (element.querySelector('input[type="file"]').files.length != 0) {
                    adminImageFormData.append(element.querySelector('input[type="file"]').name, element.querySelector('input[type="file"]').files[0], element.querySelector('input[type="file"]').name);
                }
            });

            const imageFetchSettings = {
                method: 'POST',
                body: adminImageFormData
            }

            fetch('/adminMode/image/', imageFetchSettings)
            .then(async data => {
                if (data.status === 200) {
                    const res = await data.json();
                    console.log(res.response);  
                }
            })
            .catch(err => {
                console.dir(err);
            })

            const fetchSettings = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(adminModePizzaListData)
            }

            fetch('/adminMode/', fetchSettings)
            .then(async data => {
                if (data.status === 200) {
                    const res = await data.json();
                    console.log(res.response);  
                }
            })
            .then(
                setTimeout(_ =>  window.location.reload(), 3000)
            )
            .catch(err => {
                console.dir(err);
            })
        })
    })

    orderviewButtonElement = document.getElementById("orderView");


/* ------------------------------ Back to order interface (cart) ---------------------------------------- */  


    inputElements = document.querySelectorAll("input");
    for (const input of inputElements) {
        input.addEventListener("input", event => (event.target.value.length > 2) ? event.target.value = event.target.value.slice(0, 2) : null);
    }

    const cartContent = `
        <h1>Rendelés</h1>
        <div id="addedPizzas">
        </div>
        <form id="form">
            <input type="text" name="name" placeholder="Név" required>
            <input type="number" name="zipcode" placeholder="Irányítószám" required>
            <input type="text" name="city" placeholder="Város" required>
            <input type="text" name="street" placeholder="Utca" required>
            <input type="text" name="houseNumber" placeholder="Házszám" required>
            <input type="number" name="phone" placeholder="Telefonszám" required>
            <input type="email" name="e-mail" placeholder="E-mail" required>
            <button id="order">Megrendelem</button>
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" id="coupon">Kupon hozzáadása</a>
        </form>
    `;

    cartElement.innerHTML = cartContent;    

    let orderedPizzasArray = [];
    buttonElements = document.querySelectorAll("button.pizza"); 
    for (const button of buttonElements) {
        button.addEventListener("click", (event) => {
            const pizzaAmount = document.getElementById(event.target.name).value;
            if (pizzaAmount > 0) {
                const pizzaListIndex = event.target.name.substring(10, event.target.name.length) - 1;
                document.getElementById("addedPizzas").insertAdjacentHTML("afterbegin", `<p>${pizzaAmount}x ${pizzaList[pizzaListIndex].name}</p>`)
                orderedPizzasArray.push({
                    pizzaName: pizzaList[pizzaListIndex].name,
                    amount: pizzaAmount
                })
                cartElement.classList.add("show");
                menuElement.classList.add("showing");
            }
        });
    };

    const formElement = document.getElementById("form");
    formElement.addEventListener('submit', (event) => {
        event.preventDefault();
        rootElement.classList.add('noClick');

        const today = new Date();
        const todayDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

        const formData = new FormData();
        formData.append('customerName', event.target.querySelector(`input[name="name"]`).value);
        formData.append('zipCode', event.target.querySelector(`input[name="zipcode"]`).value);
        formData.append('city', event.target.querySelector(`input[name="city"]`).value);
        formData.append('street', event.target.querySelector(`input[name="street"]`).value);
        formData.append('houseNumber', event.target.querySelector(`input[name="houseNumber"]`).value);
        formData.append('phone', event.target.querySelector(`input[name="phone"]`).value);
        formData.append('e-mail', event.target.querySelector(`input[name="e-mail"]`).value);
        formData.append('status', "open");
        let pizzaArray = [];
        for (let i = 0; i < orderedPizzasArray.length; i++) {
            pizzaArray.push({
                "pizzaName": orderedPizzasArray[i].pizzaName,
                "amount": orderedPizzasArray[i].amount
            })
            /* formData.append(`pizzaName${i + 1}`, orderedPizzasArray[i].pizzaName);
            formData.append(`amountOfPizza${i + 1}`, orderedPizzasArray[i].amount); */
        };
        formData.append('orderedPizzas', JSON.stringify(pizzaArray));
        formData.append('date', todayDate);        

        const fetchSettings = {
            method: 'POST',
            body: formData
        };

        fetch('/', fetchSettings)
        .then(async data => {
            if (data.status === 200) {
                const res = await data.json();
                console.log(res.response);
                rootElement.classList.remove('noClick');
            }
        })
        .catch(err => {
            console.dir(err);
        })

        cartElement.innerHTML = "Köszönjük rendelését!<br> Hamarosan visszük.";
    })
};

window.addEventListener('load', loadEvent);