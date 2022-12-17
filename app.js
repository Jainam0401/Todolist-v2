//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://Admin-Jainam:Jainam@cluster0.ff8lczn.mongodb.net/todolistDB");








const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Hii welcome to Jainam's Todo list😉"
});
const item2 = new Item ({
  name: "Enter you tasks by clicking on +"
});
const item3 = new Item ({
  name: "<-- You can delete the item by checking it"
});

const DefaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function (err,founditems) {
    
    if(founditems.length === 0 ) {
    Item.insertMany(DefaultItems,function (err) {
      if (err) {
        console.log(err);
      }else{
        console.log("Inserted successfully");
      } 
      });
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: founditems}); 
    } 
  });
});



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
    List.findOne({name: listName},function (err,foundList) {
      console.log(foundList)
      foundList.items.push(item);
         foundList.save();
         res.redirect("/"+listName);
    });
    
  };

});

app.get("/:topic", function(req,res){
  

  const topicName = _.capitalize(req.params.topic);
  console.log(req.params.topic);
  List.findOne({name: topicName},function (err,results) {
    if (!err) {
      if(!results){ 
        const list = new List({
          name: topicName,
          items: DefaultItems
        });
        list.save();
        res.redirect("/"+topicName);
      }else{
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  });
  });

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",function (req,res) {
 const checkedItem = req.body.checkbox;
 const listName = req.body.listname;

 if (listName === "Today"){
  Item.findByIdAndRemove(checkedItem,function (err) {
    if(err){
      console.log(err);
    }else{
      console.log("Sucessfully removed");
    } 
   });
   res.redirect("/")
 }else{
  List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItem}}},function (err,results) {
    if(!err){
      res.redirect("/"+listName)
    }
  })
 }
 
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
