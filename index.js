// the initial get request and draw 100 coins
$(".dialog").hide();
initial();

function initial() {
  $(".dialog").addClass("loader");
  $(".dialog").show();
  $(".fa-gg-circle").addClass("spin");
  $.get("https://api.coingecko.com/api/v3/coins/list", function (coin) {
    $(".dialog").hide();
    $(".dialog").removeClass("loader");
    $(".fa-gg-circle").removeClass("spin");
    for (let i = 699; i < 799; i++) {
      let symbol = coin[i].symbol.toUpperCase();
      let id = coin[i].id;
      basicInfo(symbol, id);
      search(symbol, id);
    }
    validateCheck();
    moreInfo();
    check();
  });
}

let counter = 0; // initialize counter for count to 5
let arr = []; // initialize arr for loop
function check() {
  $(".check").click(function (e) {
    // save card info into an object
    let id = $(e.target).next().children().eq(1).text();
    // if card is not checked, check it
    if ($(e.target).attr("class") === "far fa-circle check") {
      $(e.target).attr("class", "far fa-check-circle check");
      arr.push(id);
      counter++;

      // if check more than 5
      if (counter > 5) {
        $(e.target).attr("class", "far fa-circle check");
        arr.splice(arr.indexOf(id), 1);
        alert(arr);
        counter--;
      }
    } else {
      // if card is checked off
      $(e.target).attr("class", "far fa-circle check");
      counter--;
      let index = arr.indexOf(id);
      arr.splice(index, 1);
    }
  });
}

function validateCheck() {
  const cards = $(".mainCoins").find(".card");
  for (let card of cards) {
    let id = $(card).children(1).children().eq(1).text();
    // if id is in the array then check it
    if (arr.includes(id)) {
      $(card).children().eq(0).attr("class", "far fa-check-circle check");
    }
  }
}

// search function
function search() {
  // when clicked
  $(".search").click(searchFunc);
  // when enter keyup
  $(window).keyup(function (e) {
    if (e.keyCode === 13) {
      searchFunc();
    }
  });
}
function searchFunc() {
  const val = $(".searchBox").val().toLowerCase();
  const cards = $(".mainCoins").find(".card");
  let array = [];

  for (let card of cards) {
    let symbol = $(card).children(1).children().eq(0).text().toLowerCase();
    let id = $(card).children(1).children().eq(1).text();

    if (val.includes(symbol)) {
      array.push({ symbol, id });
      $(".mainCoins").show().empty().css("marginTop", "200px");
      $(".mainCoins").removeClass("onlyCoins");
      $(".currencies").addClass("searching");
      $(".header").hide();

      array.forEach((card) => {
        basicInfo(card.symbol.toUpperCase(), card.id);
        moreInfo();
        validateCheck();
      });
      check();
    }
  }
  $(".searchBox")[0].value = "";
}

// navigation
$(".first").click(function () {
  // validateCheck();
  $(".contain").show();
  $(".header").show();
  $(".future, .art").show();
  $(".currencies").removeClass("searching");
  $(".mainCoins")
    .removeClass("onlyCoins")
    .empty()
    .css("marginTop", "0px")
    .show();
  initial();
  validateCheck();
  $(".cur, .abo, rep").css("fontWeight", "100");
});

$(".cur").click(function () {
  $(".header").show();
  $(".future, .art").hide();
  $(".mainCoins").empty().addClass("onlyCoins").css("marginTop", "0px");
  initial();
  validateCheck();
  $(".currencies").removeClass("searching").show();
  $(".cur").css("fontWeight", "400");
  $(".abo, .rep").css("fontWeight", "100");
});

$(".rep").click(function () {
  // draw();
  $(".mainCoins").empty().removeClass("onlyCoins");
  $(".currencies").addClass("searching");
  $(".header").hide();
  $(".rep").css("fontWeight", "400");
  $(".abo, .cur").css("fontWeight", "100");
});

$(".abo").click(function () {
  $(".mainCoins").empty().removeClass("onlyCoins");
  $(".currencies").addClass("searching");
  $(".header").hide();
  about();
  $(".abo").css("fontWeight", "400");
  $(".cur").css("fontWeight", "100");
  $(".rep").css("fontWeight", "100");
});

// more information function -
function getInfo(coin, div) {
  if (!localStorage.getItem(coin)) {
    {
      $(".dialog").addClass("loader");
      $(".fa-gg-circle").addClass("spin");
      $(".dialog").show();

      $.get(`https://api.coingecko.com/api/v3/coins/${coin}`, function (e) {
        $(".dialog").hide();
        $(".dialog").removeClass("loader");
        $(".fa-gg-circle").removeClass("spin");
        let now = new Date($.now());
        const rates = {
          image: e.image.small,
          dollar: e.market_data.current_price.usd,
          shekel: e.market_data.current_price.ils,
          euro: e.market_data.current_price.eur,
          symbol: e.symbol.toUpperCase(),
          id: e.id,
          hours: now.getHours(),
          minutes: now.getMinutes(),
          seconds: now.getSeconds(),
        };
        extInfo(
          div,
          rates.symbol,
          rates.image,
          rates.euro,
          rates.shekel,
          rates.dollar
        );
        saveDelete(coin, rates);
        close(rates);
      });
    }
  } else {
    let LS = JSON.parse(localStorage.getItem(coin));
    let now = new Date($.now());
    let timeStamp = {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    };
    if (
      timeStamp.hours === LS.hours &&
      timeStamp.minutes >= LS.minutes + 2 &&
      timeStamp.seconds >= LS.seconds
    ) {
      localStorage.removeItem(coin);
      getInfo(coin, div);
    } else {
      extInfo(div, LS.symbol, LS.image, LS.euro, LS.shekel, LS.dollar);
    }

    // return to basic info
    close(LS);
  }
}
// Local Storage function
function saveDelete(coin, rates) {
  let json = JSON.stringify(rates);
  localStorage.setItem(coin, json);
}

// close extended card info
function close(rates) {
  $(".cls").click(function (e) {
    e.preventDefault();
    $(e.target).parent().parent().removeClass("selected");
    $(e.target).parent().html(`
          <p class="bold">${rates.symbol}</p>
          <p>${rates.id}</p>
          <button class="btn btn-primary info">Live Rates</button>`);
    moreInfo();
  });
}

// click event for extended card info
function moreInfo() {
  $(document).ready(function () {
    $(".info").click(function (e) {
      let coin = $(e.target).prev().text();
      let div = $(e.target).parent();
      getInfo(coin, div);
    });
  });
}

// basic card info
function basicInfo(symbol, id) {
  const coinCard = `<div class="card">
        <i class="far fa-circle check"></i>
        <div class="card-body">
        <p class="bold">${symbol}</p>
        <p>${id}</p>
        <button class="btn btn-primary info">Live Rates</button>
        </div>
        </div>`;
  $(".mainCoins").append(coinCard);
}

// card more info function
function extInfo(div, symbol, img, eur, ils, usd) {
  $(div.parentElement).addClass("selected");
  // create/append the div
  $(div).html(`
      <i class="fas fa-times check cls"></i>
      <img src="${img}">
      <p class="id">${symbol}</p>
      <p class="rates">€: ${eur}<br>
      ₪: ${ils}<br>
      $: ${usd}</p>`);
}

// alert box function
function alert() {
  $(".dialog").show();
  // set up the alert box
  const div = `<div class="wrap"></div>`;
  $(".dialog").append(div);
  const header = `
  <i class="fas fa-times check top"></i>
  <p class="title">You can select up to 5 coins<p>
  <p class="title2">Would you like to remove any?</p>`;
  $(".wrap").append(header);
  for (let i = 0; i < arr.length; i++) {
    let line = `<p class="coins"><i class="remove far fa-minus-square"></i>${arr[i]}</p>`;
    $(".wrap").append(line);
  }
  // exit the alert box
  $(".top").click(function () {
    $(".dialog").hide();
    $(".dialog").empty();
  });

  // un-check a coin via the alert box
  $(".remove").click(function (e) {
    let target = $(e.target).parent().text();
    // remove from array and counter
    arr.splice(arr.indexOf(target), 1);
    counter--;
    // remove check mark from actual card
    const checkedCards = $(".currencies").find("i.far.fa-check-circle.check");
    for (let check of checkedCards) {
      let id = $(check).next().children().eq(1).text();
      if (id === target) {
        $(check).attr("class", "far fa-circle check");
      }
    }
    $(".dialog").empty();
    alert(arr);
  });
}

$(window).scroll(function () {
  if ($(window).scrollTop() > 10) {
    let change = $(window).scrollTop() / 60;
    $(".contain").fadeOut(500);
    $(".one").css("left", 90 + change * 2.7 + "%");
    $(".two").css("left", 65 + change * 1.3 + "%");
    $(".three").css("left", 40 + change * 2.6 + "%");
    $(".four").css("left", 85 + change * 2 + "%");
    $(".five").css("left", 20 + change + "%");
    $(".six").css("left", 5 + change * 1.3 + "%");
    $(".seven").css("left", 35 + change * 1.5 + "%");
    $(".eight").css("left", 65 + change * 2.3 + "%");
    $(".nine").css("left", 55 + change * 2 + "%");
    $(".ten").css("left", 10 + change * 2.8 + "%");
    $(".eleven").css("left", 25 + change * 1.3 + "%");
    $(".twelve").css("left", 50 + change * 1.5 + "%");
    $(".thirteen").css("left", 70 + change * 1.3 + "%");
    $(".fourteen").css("left", 80 + change * 2 + "%");
    $(".fifteen").css("left", 15 + change * 2.5 + "%");
  } else if ($(window).scrollTop() < 300) {
    if (
      $(".mainCoins").hasClass("onlyCoins") ||
      $(".mainCoins").hasClass("searching")
    ) {
      $(".contain, .art").hide();
    } else {
      $(".contain").show();
    }
  }
});

function about() {
  const content = ` <div class="aboutPage"><img src="img/1.png" alt="network"><h1>The Future of Cryptocurrency</h1>
  <p>Cryptocurrency has grabbed the attention of investors around the globe, as well as businesses and consumers. The advantages offered by cryptocurrencies are diverse. They provide security, privacy, efficiency, and wide access, all at the same time. Their unique advantage—their decentralized and autonomous nature—has led to rapid growth in crypto transactions. </p>
  <p>Some economic analysts predict a big change in crypto is forthcoming as institutional money enters the market.<br>
  Moreover, there is the possibility that crypto will be floated on the Nasdaq, which would further add credibility to blockchain and its uses as an alternative to conventional currencies.</p></div>`;
  $(".mainCoins").append(content);
}
