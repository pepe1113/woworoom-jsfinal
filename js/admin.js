const api_path = 'pepe1113'
const token = 'AKcTDEUKmxMrKpIUos5xzvZh1aq1'
const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`
const config = {
  headers: {
    Authorization: token,
  },
}

const orderTable = document.querySelector('.js-orderTable')
let orderList = []

//GET　取得訂單列表
function getOrderList() {
  axios
    .get(`${url}`, config)
    .then(function (res) {
      orderList = res.data.orders
      renderOrder()
      c3PieChart()
    })
    .catch(function (err) {
      console.log(err)
    })
}
getOrderList()

//渲染訂單表格
function renderOrder() {
  orderTable.innerHTML = ''
  orderList.forEach(function (item, index) {
    let productTitle
    item.products.forEach(function (item) {
      productTitle += `${item.title}x${item.quantity}<br>`
    })

    let date = new Date(item.createdAt * 1000)
    date = `${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日`

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
    <td>${date}</td>
    <td class="orderStatus">
      <a href="#" data-paid=${item.paid} data-id=${item.id}>${item.paid ? '已處理' : '未處理'}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${item.id} />
    </td>
  </tr>`
  })
}

//DELETE 清除全部訂單
function deleteAllOrder(e) {
  e.preventDefault()
  if (orderList.length == 0) {
    alert('沒有訂單')
    return
  }
  if (confirm('確定清除全部訂單？')) {
    axios
      .delete(`${url}`, config)
      .then(function (res) {
        orderList = []
        renderOrder()
        c3PieChart()
      })
      .catch(function (err) {
        console.log(err)
      })
  }
}
const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click', deleteAllOrder)

//DELETE 清除單一訂單
function deleteOrder(e) {
  if (e.target.getAttribute('value') !== '刪除') {
    return
  }
  axios
    .delete(`${url}/${e.target.dataset.id}`, config)
    .then(function (res) {
      getOrderList()
    })
    .catch(function (err) {
      console.log(err)
    })
}

//改變訂單狀態(已處理/未處理)
function editOrderStatus(e) {
  if (!e.target.dataset.paid) {
    return
  }
  let id = e.target.dataset.id
  let status = e.target.dataset.paid
  if (status == 'true') {
    status = false
    e.target.textContent = '未處理'
  } else {
    status = true
    e.target.textContent = '已處理'
  }

  axios
    .put(
      `${url}`,
      {
        data: {
          id: id,
          paid: status,
        },
      },
      config
    )
    .then(function (res) {
      getOrderList()
    })
    .catch(function (err) {
      console.log(err)
    })
}

orderTable.addEventListener('click', function (e) {
  e.preventDefault()
  editOrderStatus(e)
  deleteOrder(e)
})

let allSoldProducts = []
let productsByCategory = {}
let categoryChartData = []

let productTotal = {}
let totalData = []
let totalTop3 = []

//C3圓餅圖
function c3PieChart() {
  allSoldProducts = []
  productsByCategory = {}
  categoryChartData = []
  productTotal = {}
  totalData = []
  totalTop3 = []

  orderList.forEach(function (item) {
    allSoldProducts.push(...item.products)
  })
  //全類別營收比重
  allSoldProducts.forEach(sortByCategory)
  allCategoryChart()
  //全產品營收比重
  allSoldProducts.forEach(changeTotal)
  allProductsChart()
}

//全類別營收比重
function sortByCategory(item) {
  if (productsByCategory[item.category] == undefined) {
    productsByCategory[item.category] = item.quantity * item.price
  } else {
    productsByCategory[item.category] += item.quantity * item.price
  }
}
function allCategoryChart() {
  let category = Object.keys(productsByCategory)
  category.forEach(function (item) {
    let arr = [item]
    arr.push(productsByCategory[item])
    categoryChartData.push(arr)
  })
  //c3chart 全類別營收比重
  const chart = c3.generate({
    bindto: '#sortByCategoryChart',
    data: {
      columns: categoryChartData,
      type: 'pie',
    },
    color: {
      pattern: ['#5434A7', '#9D7FEA', '#DACBFF'],
    },
  })
}

//全產品營收比重
function changeTotal(item) {
  if (productTotal[item.title] == undefined) {
    productTotal[item.title] = item.quantity * item.price
  } else {
    productTotal[item.title] += item.quantity * item.price
  }
}
function allProductsChart() {
  //取得totalData
  let title = Object.keys(productTotal)
  title.forEach(function (item) {
    let arr = [item]
    arr.push(productTotal[item])
    totalData.push(arr)
  })

  //取得totalTop3
  totalData.sort((a, b) => b[1] - a[1])
  let total
  totalData.forEach(function (item, index) {
    if (index < 3) {
      totalTop3.push(item)
    } else {
      let other = ['其他品項']
      total += item[1]
      other.push(total)
      totalTop3.push(other)
    }
  })

  //c3chart 全產品營收比重
  var chart = c3.generate({
    bindto: '#sortByProductsChart',
    data: {
      columns: totalTop3,
      type: 'pie',
    },
    color: {
      pattern: ['#5434A7', '#6A33F8', '#9D7FEA', '#DACBFF'],
    },
  })
}

//點選標題切換圖表
const chartItem = document.querySelector('.chartItem')
chartItem.addEventListener('click', changeChart)

function changeChart(e) {
  if (e.target.textContent == '全產品類別營收比重') {
    chartItem.removeAttribute('id')
  } else if (e.target.textContent == '全品項營收比重') {
    chartItem.setAttribute('id', 'allproduct')
  }
}
