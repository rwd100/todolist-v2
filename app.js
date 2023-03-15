const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use("/public",express.static("public"));

mongoose.connect("mongodb+srv://rwd100:<password>@cluster0.ueguheg.mongodb.net/todoDB");
const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("item",itemSchema);

const item1 = new Item({
    name:"This is item 1",
});
const item2 = new Item({
    name:"This is item 2",
});
const item3 = new Item({
    name:"This is item 3",
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const List = mongoose.model("List",listSchema);



app.get("/",function(req,res){
    Item.find({}).then((foundItems)=>{
        if (foundItems.length === 0){
            Item.insertMany(defaultItems).then(()=>{
            console.log("Items inserted successfully");
            });
            res.redirect("/");
        }
        else{
            // const day = date.getDate();
            res.render("list",{listTitle:"Today",newListItems:foundItems});
        }
    
});
    
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({
        name:itemName,
    });

    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    }
    else {
        List.findOne({name:listName}).then(function(foundList){
           foundList.items.push(newItem);
           foundList.save();
           res.redirect("/"+listName);
        });
    }
    
    
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then(function(foundItem){
        
        if(foundItem === null){
            const list = new List({
                name:customListName,
                items:defaultItems
             });
            list.save();
            res.redirect("/" + customListName);
        }
        else{
            res.render("list",{listTitle:foundItem.name,newListItems:foundItem.items});
        }
    });
   
    
    
});


app.get("/about",function(req,res){
    res.render("about");
});

app.post("/delete",function(req,res){
    const itemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(itemID).then(function(){
        console.log("Item deleted successfully!!");
        });

        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}}).then(function(){
            console.log("Item deleted successfully!!");
            res.redirect("/"+listName);
        });
    }
    
    
});


app.listen(3000,function(){
    console.log("The Server started on port 3000");
});
