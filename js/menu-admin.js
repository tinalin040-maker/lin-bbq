(function () {
  'use strict';

  var MENU_KEY    = 'lin_bbq_menu_v1';
  var SAUCE_KEY   = 'lin_bbq_sauces_v1';
  var SESSION_KEY = 'lin_menu_admin';
  var ADMIN_PW    = '0986';

  var DEFAULT_ITEMS = [
    {id:1,  name:'蒜酥骰子豬',     price:80},
    {id:2,  name:'帶皮雞腿肉串',   price:50},
    {id:3,  name:'香雞排',         price:75},
    {id:4,  name:'炸魷魚',         price:75},
    {id:5,  name:'松阪豬肉串',     price:65},
    {id:6,  name:'酥炸香菇',       price:65},
    {id:7,  name:'酥炸杏鮑菇',     price:55},
    {id:8,  name:'無骨鹹酥雞',     price:60},
    {id:9,  name:'雞蛋豆腐 ⭐',    price:65},
    {id:10, name:'排骨酥串',       price:60},
    {id:11, name:'豆皮培根蔥',     price:60},
    {id:12, name:'蔥牛肉串',       price:50},
    {id:13, name:'牛肉串',         price:50},
    {id:14, name:'培根皮蛋',       price:45},
    {id:15, name:'培根金針菇',     price:45},
    {id:16, name:'培根蔥',         price:45},
    {id:17, name:'蔥豬肉串',       price:50},
    {id:18, name:'肥腸',           price:45},
    {id:19, name:'招牌豬肉串 ⭐',  price:45},
    {id:20, name:'雞肉串',         price:40},
    {id:21, name:'雞屁股',         price:35},
    {id:22, name:'雞心',           price:35},
    {id:23, name:'雞皮',           price:35},
    {id:24, name:'雞翅',           price:35},
    {id:25, name:'雞胗',           price:35},
    {id:26, name:'雞軟骨',         price:45},
    {id:27, name:'洋蔥圈',         price:40},
    {id:28, name:'黃金干貝風味酥', price:40},
    {id:29, name:'酥炸甜不辣',     price:40},
    {id:30, name:'香酥柳葉魚',     price:40},
    {id:31, name:'玉米布丁酥',     price:40},
    {id:32, name:'紅龍雞塊',       price:40},
    {id:33, name:'古早味蘿蔔糕',   price:40},
    {id:34, name:'蜜紅豆年糕',     price:40},
    {id:35, name:'格子薯條',       price:40},
    {id:36, name:'薯餅',           price:40},
    {id:37, name:'地瓜QQ棒',       price:40},
    {id:38, name:'熊熊起司球',     price:40},
    {id:39, name:'紫香芋泥球',     price:40},
    {id:40, name:'黃金地瓜球',     price:40},
    {id:41, name:'薯條',           price:40},
    {id:42, name:'炸地瓜條',       price:40},
    {id:43, name:'銀絲卷（原味）', price:30},
    {id:44, name:'銀絲卷（加料）', price:40},
    {id:45, name:'龍蝦風味棒',     price:25},
    {id:46, name:'大熱狗',         price:30},
    {id:47, name:'熱狗棒',         price:30},
    {id:48, name:'花枝丸串',       price:40},
    {id:49, name:'魚板',           price:28},
    {id:50, name:'蔬菜串',         price:23},
    {id:51, name:'米腸',           price:30},
    {id:52, name:'甜不辣 ⭐',      price:25},
    {id:53, name:'原味香腸',       price:20},
    {id:54, name:'黃豆干',         price:15},
    {id:55, name:'黑豆干',         price:15},
    {id:56, name:'貢丸',           price:15},
    {id:57, name:'黑輪',           price:15},
    {id:58, name:'百葉',           price:15},
    {id:59, name:'脆丸',           price:15},
    {id:60, name:'米血',           price:15},
    {id:61, name:'長豆皮',         price:15},
    {id:62, name:'小肉豆',         price:15},
    {id:63, name:'熱狗球',         price:15},
    {id:64, name:'芋串',           price:15},
    {id:65, name:'鑫鑫腸',         price:15},
    {id:66, name:'黃金魚蛋',       price:15}
  ];

  var DEFAULT_SAUCES = [
    {id:'s1', name:'烤肉醬',         price:100},
    {id:'s2', name:'蘋果辣椒醬 ⭐',  price:380}
  ];

  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getItems() {
    try {
      var d = JSON.parse(localStorage.getItem(MENU_KEY));
      return (d && d.length) ? d : DEFAULT_ITEMS.map(function(i){ return Object.assign({},i); });
    } catch(e) {
      return DEFAULT_ITEMS.map(function(i){ return Object.assign({},i); });
    }
  }

  function getSauces() {
    try {
      var d = JSON.parse(localStorage.getItem(SAUCE_KEY));
      return (d && d.length) ? d : DEFAULT_SAUCES.map(function(s){ return Object.assign({},s); });
    } catch(e) {
      return DEFAULT_SAUCES.map(function(s){ return Object.assign({},s); });
    }
  }

  function saveItems(arr)  { localStorage.setItem(MENU_KEY, JSON.stringify(arr)); }
  function saveSauces(arr) { localStorage.setItem(SAUCE_KEY, JSON.stringify(arr)); }
  function isAdmin()       { return sessionStorage.getItem(SESSION_KEY) === '1'; }

  function renderMenu() {
    var items = getItems();
    var half  = Math.ceil(items.length / 2);
    var left  = items.slice(0, half);
    var right = items.slice(half);
    var rows  = Math.max(left.length, right.length);
    var html  = '';
    for (var i = 0; i < rows; i++) {
      var l = left[i];
      var r = right[i];
      html += '<tr>';
      html += l
        ? '<td class="item-name">' + esc(l.name) + '</td><td class="item-price">$' + l.price + '</td>'
        : '<td></td><td></td>';
      html += '<td class="divider-col"></td>';
      html += r
        ? '<td class="item-name">' + esc(r.name) + '</td><td class="item-price">$' + r.price + '</td>'
        : '<td></td><td></td>';
      html += '</tr>';
    }
    document.getElementById('menuTbody').innerHTML = html;
  }

  function renderSauces() {
    var sauces = getSauces();
    document.getElementById('sauceCards').innerHTML = sauces.map(function(s) {
      return '<div class="sauce-card">' +
        '<div class="sauce-name">' + esc(s.name) + '</div>' +
        '<div class="sauce-price">$' + s.price + ' <span>/ 罐</span></div>' +
        '</div>';
    }).join('');
  }

  function renderAdminList() {
    var items  = getItems();
    var sauces = getSauces();

    document.getElementById('adminItemList').innerHTML = items.map(function(item, idx) {
      return '<div class="madmin-row">' +
        '<span class="madmin-num">' + (idx + 1) + '</span>' +
        '<input class="madmin-name" value="' + esc(item.name) + '" maxlength="30" />' +
        '<input class="madmin-price" type="number" value="' + item.price + '" min="0" max="9999" />' +
        '<button class="madmin-del" onclick="window._mAdmin.delItem(' + idx + ')" title="刪除">🗑</button>' +
        '</div>';
    }).join('');

    document.getElementById('adminSauceList').innerHTML = sauces.map(function(s, idx) {
      return '<div class="madmin-row">' +
        '<input class="madmin-name" value="' + esc(s.name) + '" maxlength="30" />' +
        '<input class="madmin-price" type="number" value="' + s.price + '" min="0" max="9999" />' +
        '<button class="madmin-del" onclick="window._mAdmin.delSauce(' + idx + ')" title="刪除">🗑</button>' +
        '</div>';
    }).join('');
  }

  function saveAll() {
    var itemRows  = document.querySelectorAll('#adminItemList .madmin-row');
    var sauceRows = document.querySelectorAll('#adminSauceList .madmin-row');

    var items = Array.prototype.slice.call(itemRows).map(function(row, idx) {
      return {
        id:    DEFAULT_ITEMS[idx] ? DEFAULT_ITEMS[idx].id : Date.now() + idx,
        name:  row.querySelector('.madmin-name').value.trim(),
        price: parseInt(row.querySelector('.madmin-price').value) || 0
      };
    }).filter(function(i){ return i.name; });

    var sauces = Array.prototype.slice.call(sauceRows).map(function(row, idx) {
      return {
        id:    DEFAULT_SAUCES[idx] ? DEFAULT_SAUCES[idx].id : 's' + (Date.now() + idx),
        name:  row.querySelector('.madmin-name').value.trim(),
        price: parseInt(row.querySelector('.madmin-price').value) || 0
      };
    }).filter(function(s){ return s.name; });

    saveItems(items);
    saveSauces(sauces);
    renderMenu();
    renderSauces();
    document.getElementById('menuAdminOverlay').style.display = 'none';
    showToast('菜單已儲存！');
  }

  function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'madmin-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 10);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2200);
  }

  function showCorrectPanel() {
    if (isAdmin()) {
      document.getElementById('menuLoginBox').style.display  = 'none';
      document.getElementById('menuAdminPanel').style.display = 'block';
      renderAdminList();
    } else {
      document.getElementById('menuLoginBox').style.display  = 'block';
      document.getElementById('menuAdminPanel').style.display = 'none';
    }
  }

  window._mAdmin = {
    delItem: function(idx) {
      var items = getItems();
      if (!confirm('確定刪除「' + items[idx].name + '」？')) return;
      items.splice(idx, 1);
      saveItems(items);
      renderAdminList();
    },
    delSauce: function(idx) {
      var sauces = getSauces();
      if (!confirm('確定刪除「' + sauces[idx].name + '」？')) return;
      sauces.splice(idx, 1);
      saveSauces(sauces);
      renderAdminList();
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    renderMenu();
    renderSauces();

    var trigger   = document.getElementById('menuAdminTrigger');
    var overlay   = document.getElementById('menuAdminOverlay');
    var closeBtn  = document.getElementById('menuAdminClose');
    var loginForm = document.getElementById('menuLoginForm');
    var loginErr  = document.getElementById('menuLoginError');
    var saveBtn   = document.getElementById('menuSaveBtn');
    var logoutBtn = document.getElementById('menuLogoutBtn');
    var addItem   = document.getElementById('menuAddItem');
    var addSauce  = document.getElementById('menuAddSauce');

    trigger.addEventListener('click', function() {
      overlay.style.display = 'flex';
      showCorrectPanel();
    });

    closeBtn.addEventListener('click', function() {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var pw = document.getElementById('menuPwInput').value;
      if (pw === ADMIN_PW) {
        sessionStorage.setItem(SESSION_KEY, '1');
        loginErr.style.display = 'none';
        document.getElementById('menuPwInput').value = '';
        showCorrectPanel();
      } else {
        loginErr.style.display = 'block';
        document.getElementById('menuPwInput').value = '';
      }
    });

    saveBtn.addEventListener('click', saveAll);

    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem(SESSION_KEY);
      overlay.style.display = 'none';
    });

    addItem.addEventListener('click', function() {
      var items = getItems();
      items.push({id: Date.now(), name: '新品項', price: 0});
      saveItems(items);
      renderAdminList();
      var list = document.getElementById('adminItemList');
      list.scrollTop = list.scrollHeight;
    });

    addSauce.addEventListener('click', function() {
      var sauces = getSauces();
      sauces.push({id: 's' + Date.now(), name: '新醬料', price: 0});
      saveSauces(sauces);
      renderAdminList();
    });
  });

})();
