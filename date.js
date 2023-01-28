exports.getDate = function (){
  let options = {
    day: "numeric",
    month: "long",
    weekday: "long"
  }

  let today = new Date();
  return today.toLocaleDateString("en-US", options);
}

exports.getDay = function (){
  let options = {
    weekday: "long"
  }

  let today = new Date();
  return today.toLocaleDateString("en-US", options);
}
