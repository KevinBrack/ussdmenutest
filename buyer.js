const db = require("./data/dbConfig");
const UssdMenu = require("ussd-menu-builder");
let menu = new UssdMenu();

// Define menu states
menu.startState({
  run: () => {
    // use menu.con() to send response without terminating session
    menu.con("Welcome. Choose option:" + "\n1. Buyer" + "\n2. Seller");
  },
  // next object links to next state based on user input
  next: {
    "1": "markets",
    "2": "postForSale"
  }
});

const fetchMarkets = (phoneNumber, session, text) => {
  const market = "Bujumbaru";
  console.log("FETCH P#: ", phoneNumber);
  console.log("FETCH SESH: ", session);
  console.log("FETCH TEXT: ", text);
  return db("products")
    .where({ market: market })
}

menu.state("markets", {

  run: () => {
    fetchMarkets(menu.args.phoneNumber, menu.args.sessionId, menu.args.text)
      .then(res => {
        console.log("DB RES: ", res);
        if(res.length > 0) {
          let options = "";
          for(let i = 0; i < res.length; i++){
            options += `\n#${res[i].id}: ${res[i].product} $${res[i].price}`
          }
          menu.con(`Fetched ${res.length} items from db${options}`)
        } else {
          menu.con("Found no products in that market that match your selection")
        }
      })
      .catch(err => {
        menu.con(err);
      })
  },

  next: {"0": "start"},

  defaultNext: "product"
})

menu.state("product", {
  run: () => {
    // gives you an array of all the decisions
    // the user has made. 
    // the last item in that array is the most recent
    // menu.args.text.split("*")

    // sets a key/value that can be used anywhere else in the application
    menu.session.set({"product_id": menu.args.text.split("*")})
    // retreives the value for the key stored for the session
    menu.session.get("product_id")
  }
})

menu.state("done", {
  run: () => {
    menu.end('Goodbye');
  }
})


// STATE FROM IN DEMO STUCK
// menu.state("markets", {
//   run: () => {
//     const market = "Bujumbaru";

//     // const markets = await db.find("products")
//     // .where({menu.val});
//     menu.con(`The products available at ${market}`);
//     // return markets;
//   },
  
//   next: () => {
//     const market = "Bujumbaru";
    
    // db("products")
    //   .where({ market: market })
//       .then(products => {
//         const options = {};
//         // console.log("DBPRODUCTS", products)
//         for (let i = 0; i < products.length; i++) {
//           options[i + 1] = `${products[i].product} ${products[i].price} `;

//         }
//         console.log("OPTIONS", options)
//         return options;
//       });

//   }
// });

menu.state("Test", {
  run: () => {
    menu.end("You made it!");
  }
});

menu.state("postForSale", {
  run: () => {
    menu.con("Enter a country:");
  },
  next: {
    "*[a-zA-Z]+": "addCountry"
  }
});

// nesting states
menu.state("addCountry", {
  run: () => {
    // use menu.val to access user input value
    let country = menu.val;
    const product = {
      country: country,
      market: "market",
      product: "product",
      price: "price"
    };
    db("products")
      .insert(product)
      .then(res => {
        menu.end("Country added successfully!");
      })
      .catch(err => {
        menu.end("Fail");
      });
  }
});

// Registering USSD handler with Express

// app.post("*", function(req, res) {
//   menu.run(req.body, ussdResult => {
//     res.send(ussdResult);
//   });
//   //   let post = req.body;
//   //   addPost(post)
//   //     .then(saved => {
//   //       res.status(201).json(saved);
//   //     })
//   //     .catch(({ message }) => {
//   //       res.status(503).json({ message });
//   //     });
// });

app.post('*', (req, res) => {
  let args = {
      phoneNumber: req.body.phoneNumber,
      sessionId: req.body.sessionId,
      serviceCode: req.body.serviceCode,
      text: req.body.text
  };
  menu.run(args, resMsg => {
      console.log("PHONE: ", args.phoneNumber);
      console.log("SESSION: ", args.sessionId);
      console.log("SERVICE CODE: ", args.serviceCode);
      console.log("TEXT: ", args.text);
      res.send(resMsg);
  });
})

export default menu;