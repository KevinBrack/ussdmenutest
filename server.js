const app = require("express")();
const bodyParser = require("body-parser");
const db = require("./data/dbConfig");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("It's alive!");
});

app.get("/products", (req, res) => {
  db("products")
    .then(products => {
      res.status(200).json(products);
    })
    .catch(err => {
      res.status(400).json({ message: "Fail" });
    });
});

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

menu.state("markets", {
  run: () => {
    const markets = products.market.filter(item => item.menu.val);
    menu.con("Welcome. Choose option:");
    return markets;
  },
  next: {
    "*\\d+": "Test"
  }
});

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

app.post("*", function(req, res) {
  menu.run(req.body, ussdResult => {
    res.send(ussdResult);
  });
  //   let post = req.body;
  //   addPost(post)
  //     .then(saved => {
  //       res.status(201).json(saved);
  //     })
  //     .catch(({ message }) => {
  //       res.status(503).json({ message });
  //     });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`\nAPI running on port ${port}\n`));
