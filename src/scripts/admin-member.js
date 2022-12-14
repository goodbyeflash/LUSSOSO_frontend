import '../styles/reset.scss';
import '../styles/admin.scss';
import '../styles/layer.scss';
import api from './lib/api';

let pageCount = 1;
let lastPageNum = 0;
let type = 'all';
let data = {};
let adminItems;
let columns = [
  { header: '이름', key: 'name', width: 25 },
  { header: '연락처', key: 'hp', width: 25 },
  { header: '지점', key: 'branch', width: 25 },
  { header: 'ip', key: 'ip', width: 25 },
  { header: '등록날짜', key: 'publishedDate', width: 30 },
];

window.onload = () => {
  api('get', 'admin/check', undefined, (res) => {
    if (res) {
      if (res.msg && res.msg == 'ERROR') {
        location.href = 'admin.html';
        return;
      }

      document.getElementById('prev').onclick = () => {
        if (pageCount == 1) {
          return;
        } else {
          pageCount--;
          onloadUserTable();
        }
      };

      document.getElementById('next').onclick = () => {
        if (pageCount == lastPageNum) {
          return;
        } else {
          pageCount++;
          onloadUserTable();
        }
      };

      document.getElementById('findBtn').onclick = () => {
        data = {};
        data[document.getElementById('findSelect').value] =
          document.getElementById('findText').value;
        pageCount = 1;
        type = 'find';
        window.sessionStorage.setItem('user_filter', JSON.stringify(data));
        onloadUserTable();
      };

      onloadUserTable();

      document.getElementById('findClear').onclick = () => {
        window.sessionStorage.clear('user_filter');
        document.getElementById('findText').value = '';
        pageCount = 1;
        data = {};
        type == 'all';
        onloadUserTable();
      };

      document.getElementsByClassName('btn btn-excel')[0].onclick = () => {
        api(
          'post',
          'excel/download',
          {
            columns: columns,
          },
          (res) => {
            const blob = new Blob([res.result.data], {
              type: res.result.headers['content-type'],
            });
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = '고객 리스트.xlsx';
            a.click();
          }
        );
      };
      onClickLogoutButton();
      document.getElementsByTagName('body')[0].style.display = 'block';
    }
  });
};

function onloadUserTable() {
  const table = document
    .getElementsByClassName('table')[0]
    .getElementsByTagName('tbody')[0];
  const filter = window.sessionStorage.getItem('user_filter');
  let method = type == 'find' || filter ? 'post' : 'get';
  let url = type == 'find' || filter ? 'users/find' : 'users';

  // 검색 된 필터 있을 경우
  if (filter) {
    data = JSON.parse(filter);
    const key = Object.keys(data)[0];
    const value = data[key];
    const selectOptions = [
      ...document.getElementById('findSelect').getElementsByTagName('option'),
    ];
    selectOptions.forEach((optionEl) => {
      if (optionEl.value == key) {
        optionEl.selected = true;
      }
    });
    document.getElementById('findText').value = value;
  }

  api(method, `${url}?page=${pageCount}`, data, (res) => {
    if (res) {
      if (res.msg && res.msg == 'OK') {
        lastPageNum = res.result.headers['last-page'];
        adminItems = res.result.data;
        table.innerHTML = '';
        adminItems.forEach((item, index) => {
          table.innerHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.hp}</td>
            <td>${item.branch}</td>
            <td>${item.ip}</td>
            <td>${new Date(item.publishedDate).YYYYMMDDHHMMSS()}</td>
            <td>
                <button type="button" id="update_${index}" data-val="${
            item._id
          }" class="btn btn-primary">수정</button>
                <button type="button" id="delete_${index}" data-val="${
            item._id
          }" class="btn btn-cancel">삭제</button>
            </td>
            </tr>`;
        });

        for (let index = 0; index < adminItems.length; index++) {
          document.getElementById(`update_${index}`).onclick = (e) => {
            location.href = `admin-member-edit.html?_id=${e.target.getAttribute(
              'data-val'
            )}`;
          };
        }

        for (let index = 0; index < adminItems.length; index++) {
          document.getElementById(`delete_${index}`).onclick = (e) => {
            if (window.confirm('정말 삭제 하시겠습니까?')) {
              api(
                'delete',
                `users/${e.target.getAttribute('data-val')}`,
                undefined,
                (res) => {
                  if (res.msg && res.msg == 'ERROR') {
                    alert('오류가 발생하였습니다.');
                    return;
                  } else {
                    onloadUserTable();
                  }
                }
              );
            }
          };
        }

        document.getElementById(
          'pageNav'
        ).innerText = `${pageCount}/${lastPageNum}`;
      } else {
        console.log('[API] => 고객 전체 목록을 불러올 수 없습니다.');
      }
    }
  });
}

function onClickLogoutButton() {
  document.getElementById('logout').onclick = () => {
    api('post', 'admin/logout', undefined, (res) => {
      if (res) {
        if (res.msg == 'OK') {
          alert('로그아웃 되었습니다.');
          location.href = 'admin.html';
        } else {
          alert('오류가 발생했습니다.');
        }
      }
    });
  };
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

Date.prototype.YYYYMMDDHHMMSS = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var dd = pad(this.getDate(), 2);
  var hh = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);
  var ss = pad(this.getSeconds(), 2);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};
