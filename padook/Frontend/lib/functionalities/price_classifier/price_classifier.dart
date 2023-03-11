

//Aqui vemos si el precio del coche es buen precio segun las comparativas

String priceClasifier(price, minimumPrice, maximumPrice) {
  String result = "";
  double middleRight = (maximumPrice - minimumPrice) / 1.33 + minimumPrice;
  double middleLeft = (maximumPrice - minimumPrice) / 4 + minimumPrice;
  if (price == maximumPrice && price == minimumPrice) {
    result = "¿🤨?";
  }
  else if (price <= maximumPrice && price >= middleRight) {
    result = "Caro";
  } else if (price <= middleRight && price >= middleLeft) {
    result = "Promedio";
  } else {
    result = "Buen precio";
  }
  return result;
}