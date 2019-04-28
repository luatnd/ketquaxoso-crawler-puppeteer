/**
 * mongo query
 */
var number = "02";
var numberExp = new RegExp('.*' + number + '$', 'i');
db.getCollection("daily_result")
  .find(
    { "0": numberExp },
    { "date": 1, "0": 1 }
  )
  .sort({ "date": -1 });

// TODO: Create a tool to draw graph for all number
// And use GA to track

/*
Input: 02
Output:
{
    "_id" : ObjectId("5cc5352858e54d19842fdd6e"),
    "0" : [
        "41702"
    ],
    "date" : "20190426"
}
// ----------------------------------------------
{
    "_id" : ObjectId("5cc5352358e54d19842fdce6"),
    "0" : [
        "09702"
    ],
    "date" : "20190308"
}
// ----------------------------------------------
{
    "_id" : ObjectId("5cc5351c58e54d19842fdc30"),
    "0" : [
        "41302"
    ],
    "date" : "20181220"
}
 */