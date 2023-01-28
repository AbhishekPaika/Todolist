const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to MongoDB by specifying port to access MongoDB server
main().catch(err => console.log(err));

async function main() {
mongoose.set('strictQuery', false);
await mongoose.connect("mongodb+srv://AbhishekPaika:Test123@cluster0.zwiph.mongodb.net/newToDoListDB");
}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-Do-List!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  // const day = date.getDate();

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added all the item documents to newToDoListDB");
        }
      });
      res.redirect("/");
    }else if (err){
      console.log(err);
    }else{
        res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){

      if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    list.save()
    res.redirect("/" + customListName);
    }else{
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  });
});

// Item.deleteMany({"_id" :["61611ba4441d98d3d7873b6e", "61611ba4441d98d3d7873b6f", "61611ba4441d98d3d7873b70", "616170351a2ae21f68d19ad8", "616170351a2ae21f68d19ad9", "616170351a2ae21f68d19ada"]}, function (err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully deleted all the documents");
//   }
// });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){

    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){

      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function(){
  console.log("Server started on port 3000");
});
