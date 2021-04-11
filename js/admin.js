const api_path = "pepe1113";
const token = "AKcTDEUKmxMrKpIUos5xzvZh1aq1";
const url = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`;
const config = {
  headers: {
    Authorization: token,
  },
};

const orderTable = document.querySelector(".js-orderTable");
let orderList = [];
let productTitle;

//GET　取得訂單列表
function getOrderList() {
  axios
    .get(`${url}`, config)
    .then(function (res) {
      orderList = res.data.orders;
      renderOrder();
      c3PieChart();
    })
    .catch(function (err) {
      console.log(err);
    });
}
getOrderList();

//渲染訂單表格
function renderOrder() {
  orderTable.innerHTML = "";
  orderList.forEach(function (item, index) {
    productTitle = "";
    item.products.forEach(function (item) {
      productTitle += `${item.title}<br>`;
    });

    orderTable.innerHTML += `<tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      <p>${productTitle}</p>
    </td>
    <td>${item.createdAt}</td>
    <td class="orderStatus">
      <a href="#" data-num=${index}>${item.paid ? "已處理" : "未處理"}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${
        item.id
      } />
    </td>
  </tr>`;
  });
}

//DELETE 清除全部訂單
function deleteAllOrder(e) {
  e.preventDefault();
  if (confirm("確定清除全部訂單？")) {
    axios
      .delete(`${url}`, config)
      .then(function (res) {
        orderList = [];
        renderOrder();
        c3PieChart();
      })
      .catch(function (err) {
        console.log(err);
      });
  }
}
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", deleteAllOrder);

//DELETE 清除單一訂單
function deleteOrder(e) {
  e.preventDefault();
  console.log(e.target.dataset.id);
  orderList.forEach(function (item) {
    if (e.target.value === "刪除") {
      axios
        .delete(`${url}/${e.target.dataset.id}`, config)
        .then(function (res) {
          orderList = res.data.orders;
          renderOrder();
          c3PieChart();
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  });
}
orderTable.addEventListener("click", deleteOrder);

//改變訂單狀態(已處理/未處理)
function changeStatus(e) {
  e.preventDefault();
  if (e.target.textContent === "未處理") {
    e.target.textContent = "已處理";
    e.target.setAttribute("class", "red");
    orderList[e.target.dataset.num].paid = true;
  } else if (e.target.textContent === "已處理") {
    e.target.textContent = "未處理";
    e.target.removeAttribute("class");
    orderList[e.target.dataset.num].paid = false;
  }
}
orderTable.addEventListener("click", changeStatus);

let allSoldProducts = [];
let productsByCategory = {};
let categoryChartData = [];

let productTotal = {};
let totalData = [];
let totalTop3 = [];

//C3圓餅圖
function c3PieChart() {
  letEmpty();
  orderList.forEach(changeSoldProducts);
  //全類別營收比重
  allSoldProducts.forEach(sortByCategory);
  toCategoryData();
  allCategoryChart();
  //全產品營收比重
  allSoldProducts.forEach(changeTotal);
  toTotalData();
  sortByTotal();
  allProductsChart();
}

function letEmpty() {
  allSoldProducts = [];
  productsByCategory = {};
  categoryChartData = [];
  productTotal = {};
  totalData = [];
  totalTop3 = [];
}

//取得allSoldProducts
function changeSoldProducts(item) {
  allSoldProducts.push(...item.products);
}
//取得productsByCategory
function sortByCategory(item) {
  if (productsByCategory[item.category] == undefined) {
    productsByCategory[item.category] = item.quantity * item.price;
  } else {
    productsByCategory[item.category] += item.quantity * item.price;
  }
}
//取得categoryChartData
function toCategoryData() {
  let category = Object.keys(productsByCategory);
  category.forEach(function (item) {
    let arr = [item];
    arr.push(productsByCategory[item]);
    categoryChartData.push(arr);
  });
}
//c3chart 全類別營收比重
function allCategoryChart() {
  const chart = c3.generate({
    bindto: "#sortByCategoryChart",
    data: {
      columns: categoryChartData,
      type: "pie",
    },
    color: {
      pattern: ["#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}

//取得productTotal
function changeTotal(item) {
  if (productTotal[item.title] == undefined) {
    productTotal[item.title] = item.quantity * item.price;
  } else {
    productTotal[item.title] += item.quantity * item.price;
  }
}
//取得totalData
function toTotalData() {
  let title = Object.keys(productTotal);
  title.forEach(function (item) {
    let arr = [item];
    arr.push(productTotal[item]);
    totalData.push(arr);
  });
}
//取得totalTop3
function sortByTotal() {
  totalData.sort((a, b) => b[1] - a[1]);

  let otherTotal = 0;
  totalData.forEach(function (item, index) {
    if (index < 3) {
      totalTop3.push(item);
    } else {
      otherTotal += item[1];
    }
  });
  let other = ["其他"];
  other.push(otherTotal);
  totalTop3.push(other);
}
//c3chart 全產品營收比重
function allProductsChart() {
  var chart = c3.generate({
    bindto: "#sortByProductsChart",
    data: {
      columns: totalTop3,
      type: "pie",
    },
    color: {
      pattern: ["#5434A7", "#6A33F8", "#9D7FEA", "#DACBFF"],
    },
  });
}

//點選標題切換圖表
const chartItem = document.querySelector(".chartItem");
chartItem.addEventListener("click", changeChart);

function changeChart(e) {
  if (e.target.textContent == "全產品類別營收比重") {
    chartItem.removeAttribute("id");
  } else if (e.target.textContent == "全品項營收比重") {
    chartItem.setAttribute("id", "allproduct");
  }
}
