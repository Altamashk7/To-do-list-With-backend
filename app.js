//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const { assert } = require('console');
const mongoose=require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb+srv://admin-ak:ak123@cluster0.dxcir.mongodb.net/todoListDB")

const itemsSchema = new mongoose.Schema({
  name:String
  
});

const Item = mongoose.model("Item", itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const todoItemOne = new Item({
  name: "Welcome to your todolist!"
});

const todoItemTwo = new Item({
  name: "Hit the + button to add a new item."
});

const todoItemThree = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [todoItemOne, todoItemTwo, todoItemThree]

const listSchema={
  name: String,
  items:[itemsSchema]
};
 const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err,foundItems)
{
if(foundItems.length===0)
{
  Item.insertMany(defaultItems,function(err ){
    if (err){
    console.log(err);
  } else{
  
    console.log("successfully inserted");
  }
  
    });
  
res.redirect("/");  

}
else{
  res.render("list", {listTitle: "Today", newListItems:foundItems});

}
 
  
})

  

});


app.get("/:customListName",function(req,res)
{
const customListName=_.capitalize(req.params.customListName);
console.log(customListName+"b");
List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();

      res.redirect("/" + customListName);
    }else{
      // Show an existing list

      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  }
});

  
})

app.post("/", function(req, res){
  const listName = req.body.listSubmit;
  const itemName = req.body.newTodo;

  console.log(listName);

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        if(foundList){
          foundList.items.push(newItem);
          foundList.save();

          res.redirect("/" + listName);
        }
      }
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete",function(req,res)
{
const checkedItemId=req.body.checkbox;
const listName=req.body.listName;
if(listName === "Today")
{
Item.findByIdAndRemove(checkedItemId,function(err)
{
if(!err)
{
  console.log("successfully deleted");
  res.redirect("/");
}

});


}

else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList)
  {
if(!err){
  res.redirect("/"+listName);
}


  })
}

}







);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
