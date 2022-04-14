const loadEvent = async () => {
    const rootElement2 = document.getElementById("root2");

    let orderArray = "";

    await fetch('/order-view/orders/')
        .then(response => response.json())
        .then(data => {
            orderArray = data;
        });

    console.dir(orderArray);
  

    rootElement2.insertAdjacentHTML("afterbegin", 
       
        orderArray.map((order, index) => `
        <div id="order">
            <h1>Order No. ${index + 1}</h1>
            <br>
            <h1>Name: ${order.customerName}</h1>
            <p>Zip code: ${order.zipCode}</p>
            <p>City: ${order.city}</p>
            <p>Address: ${order.street} ${order.houseNumber}</p>
            <p>Phone: ${order.phone}</p>
            
            <br>
            <h2>Ordered items: </h2>
            ${JSON.parse(order.orderedPizzas).map(pizza => {
                return `
                    <p>Pizza name: ${pizza.pizzaName}</p>
                    <p>Amount: ${pizza.amount}</p><br>
                `
            }).join("")}
            <p>Order placed on: ${order.date}</p>
            <br>
            <p>Status: <button class="orderStatus">${order.status}</button></p>
        </div>
        `).join("")
    );
    
    const buttons = document.querySelectorAll("button")

    console.log(buttons); 

    
    for (const button of buttons) {
            button.addEventListener("click", () => {
            
                button.classList.toggle("turnGreen")

                    if (button.textContent === "open") {
                        button.textContent = "closed"
                    } else {
                        button.textContent = "open" 
                    }  
            })
    }
   
}


window.addEventListener('load', loadEvent); 