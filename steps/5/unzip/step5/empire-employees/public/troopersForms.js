function toggleFieldViaRadio(event) {
  let radioRemove = document.querySelector('#radioRemove');
  let radioMove = document.querySelector('#radioMove');
  let fieldToHide = document.querySelector('#garrisonMoveToField');

  console.log("hello click");

  if (radioRemove.checked()) {
    fieldToHide.type = "hidden";
  } else {
    fieldToHide.type = "number";
  }
}

function hello() {
  console.log("hello world");
}

h1 = document.querySelector("h1");
h1.addEventListener('click', () => hello);
