const api_path = "pepe1113";
const token = "AKcTDEUKmxMrKpIUos5xzvZh1aq1";
const url = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}`;

let productList = [];
let cartList = [];
let finalTotal;
const productWrap = document.querySelector(".productWrap");
const carts = document.querySelector(".js-carts");
const deleteAllBtn = document.querySelector(".discardAllBtn");
const orderForm = document.querySelector("#orderInfo");
const orderInputs = document.querySelectorAll("#orderInfo input");
const submitBtn = document.querySelector(".orderInfo-btn");

//初始化
function init() {
  getProductList();
  getCartList();
}
init();

//GET 取得產品列表
function getProductList() {
  axios
    .get(`${url}/products`)
    .then(function (res) {
      productList = res.data.products;
      renderProductList(productList);
    })
    .catch(function (err) {
      console.log(err);
    });
}

//渲染產品列表
function renderProductList(list) {
  productWrap.innerHTML = "";
  list.forEach(function (item) {
    productWrap.innerHTML += `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img
    src="${item.images}"
    alt=""
    />
    <a href="#" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${[item.origin_price].toLocaleString()}</del>
    <p class="nowPrice">NT$${[item.price].toLocaleString()}</p>
</li>`;
  });
}

//GET 取得購物車列表
function getCartList() {
  axios
    .get(`${url}/carts`)
    .then(function (res) {
      cartList = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartList();
    })
    .catch(function (err) {
      console.log(err);
    });
}

//渲染購物車列表
const totalAmount = document.querySelector(".js-totalAmount");
function renderCartList() {
  carts.innerHTML = "";
  cartList.forEach(toRenderCartStr);
  totalAmount.textContent = `NT$${[finalTotal].toLocaleString()}`;
}

function toRenderCartStr(item, index) {
  let price = [item.product.price].toLocaleString();
  let total = [item.product.price * item.quantity].toLocaleString();
  carts.innerHTML += `<tr>
    <td>
    <div class="cardItem-title">
    <img src="${item.product.images}" alt="" />
    <p>${item.product.title}</p>
    </div>
    </td>
    <td>NT$${price}</td>
    <td>${item.quantity}</td>
    <td>NT$${total}</td>
    <td class="discardBtn">
        <a href="#" class="material-icons" id="js-clear" data-id=${item.id}> clear </a>
    </td>
    </tr>`;
}

//POST 新增購物車品項
productWrap.addEventListener("click", addCartList);
function addCartList(e) {
  if (e.target.getAttribute("id") === "addCardBtn") {
    e.preventDefault();
    let obj = {};
    obj.data = {};
    obj.data.productId = e.target.getAttribute("data-id");

    let alreadyAddArr = cartList.filter(
      (i) => i.product.id === obj.data.productId
    );
    if (alreadyAddArr.length === 0) {
      obj.data.quantity = 1;
    } else {
      obj.data.quantity = alreadyAddArr[0].quantity + 1;
    }
    postCartList(obj);
    loading();
  }
}

function postCartList(obj) {
  axios
    .post(`${url}/carts`, obj)
    .then(function (res) {
      cartList = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartList();
      alert("新增商品成功！");
    })
    .catch(function (err) {
      console.log(err);
    });
}

//loading page by jquery-loading
function loading() {
  setTimeout(function () {
    $("body").loading({
      theme: "dark",
    });
  });
  setTimeout(function () {
    $("body").loading("stop");
  }, 2000);
}

//DELETE 刪除全部購物車
function deleteAllCartList() {
  axios
    .delete(`${url}/carts`)
    .then(function (res) {
      cartList = [];
      finalTotal = 0;
      renderCartList();
      alert("已刪除所有商品");
    })
    .catch(function (error) {
      console.log(error);
      alert("購物車已無商品");
    });
}

deleteAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  deleteAllCartList();
  loading();
});

//DELETE 刪除單品項商品
carts.addEventListener("click", deleteCartList);
function deleteCartList(e) {
  e.preventDefault();
  if (e.target.getAttribute("id") === "js-clear") {
    let productId = e.target.getAttribute("data-id");
    loading();
    deleteCartListApi(productId);
  }
}

function deleteCartListApi(id) {
  axios
    .delete(`${url}/carts/${id}`)
    .then(function (res) {
      cartList = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartList();
      alert("已刪除商品！");
    })
    .catch(function (err) {
      console.log(err);
    });
}

//驗證條件
const constraints = {
  姓名: {
    presence: {
      message: "為必填項目",
    },
  },
  電話: {
    presence: {
      message: "為必填項目",
    },
    numericality: {
      message: "^請填寫正確電話號碼",
    },
  },
  Email: {
    presence: {
      message: "為必填項目",
    },
    email: {
      message: "^請填寫正確email格式",
    },
  },
  寄送地址: {
    presence: {
      message: "為必填項目",
    },
  },
};

function ValueErrorCheck() {
  orderInputs.forEach(function (item) {
    item.addEventListener("change", function (e) {
      item.nextElementSibling.textContent = "";
      let errors = validate(orderForm, constraints);
      item.nextElementSibling.textContent = errors[this.name];
    });
  });
}
ValueErrorCheck();

function checkErrors() {
  let errors = validate(orderForm, constraints);
  let list = Object.keys(errors);
  list.forEach(function (item) {
    document.querySelector(`.${item}`).textContent = errors[item];
  });
}

//POST 送出預訂資料
let data = {};
let orderData = {};
const formName = document.querySelector("#customerName");
const phone = document.querySelector("#customerPhone");
const email = document.querySelector("#customerEmail");
const address = document.querySelector("#customerAddress");
const pay = document.querySelector("#tradeWay");

submitBtn.addEventListener("click", addOrder);
function addOrder(e) {
  e.preventDefault();
  let errors = validate(orderForm, constraints);
  if (errors) {
    checkErrors();
    return;
  }
  getFormValue();
  addOrderPost(orderData);
}

function getFormValue() {
  let user = {
    name: formName.value,
    tel: String(phone.value),
    email: email.value,
    address: address.value,
    payment: pay.value,
  };
  data.user = user;
  orderData.data = data;
}

function addOrderPost(obj) {
  axios
    .post(`${url}/orders`, obj)
    .then(function (res) {
      orderForm.reset();
      cartList = [];
      finalTotal = 0;
      renderCartList();
      alert("訂購成功！");
    })
    .catch(function (error) {
      console.log(error);
      alert("購物車沒有商品哦 Σヽ(ﾟД ﾟ; )ﾉ");
    });
}

//篩選產品列表
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", changeSelectValue);

function changeSelectValue(e) {
  let data = [];
  productList.forEach(function (item) {
    if (productSelect.value === "全部") {
      renderProductList(productList);
    } else if (productSelect.value === item.category) {
      data.push(item);
      renderProductList(data);
    }
  });
}
