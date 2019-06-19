const app = require("express")();
const bodyParser = require("body-parser");
const db = require("./data/dbConfig");
const seller = require("./sellerStates");

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
        res.status(400).json({message: "Fail"})
      });
})

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
    menu.con(
      "Welcome. Choose option:" +
        "\n1. Bujumbaru" +
        "\n2. Tororo" +
        "\n3. Mbale" +
        "\n4. Eldoret" +
        "\n5. Kisumu" +
        "\n6. Soroti" +
        "\n7. Ownio" +
        "\n8. Kampala"
    );
  },
  next: {
    "1": "Bujumbaru",
    "2": "Tororo",
    "3": "Mbale",
    "4": "Eldoret",
    "5": "Kisumu",
    "6": "Soroti",
    "7": "Ownio",
    "8": "Kampala"
  }
});

menu.state("Bujumbaru", {
  run: () => {
    // fetch balance
    fetchBalance(menu.args.phoneNumber).then(function(bal) {
      // use menu.end() to send response and terminate session
      menu.end("Your balance is KES " + bal);
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
