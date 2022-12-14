import '../styles/reset.scss';
import '../styles/admin.scss';
import api from './lib/api';

window.onload = () => {
  api('get', 'admin/check', undefined, (res) => {
    if (res) {
      if (res.msg && res.msg == 'ERROR') {
        location.href = 'admin.html';
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const _id = params.get('_id');
      if (_id) {
        api('get', `users/${_id}`, undefined, (res) => {
          if (res.msg == 'OK') {
            const data = res.result.data;

            const nameEl = document.getElementById('name');
            const hpEl = document.getElementById('hp');
            const branchEl = document.getElementById('branch');
            const ipEl = document.getElementById('ip');
            const publishedDateEl = document.getElementById('publishedDate');

            nameEl.value = data.name;
            hpEl.value = data.hp;
            branchEl.value = data.branch;
            ipEl.innerText = data.ip;
            publishedDateEl.innerText = new Date(
              data.publishedDate
            ).YYYYMMDDHHMMSS();

            nameEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            hpEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            branchEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            document.getElementById('updateBtn').onclick = () => {
              if (nameEl.value == '') {
                alert('성명을 입력해주세요.');
                return;
              }

              if (hpEl.value == '') {
                alert('연락처를 입력해주세요.');
                return;
              }

              if (branchEl.value == '') {
                alert('지점명을 입력해주세요.');
                return;
              }

              const patchData = {
                name: nameEl.value,
                hp: hpEl.value,
                branch: branchEl.value,
              };
              api('patch', `users/${_id}`, patchData, (res) => {
                if (res.msg == 'OK') {
                  alert('수정되었습니다.');
                  history.back();
                } else {
                  alert('오류가 발생하였습니다.');
                }
              });
            };
          }
          onClickLogoutButton();
          document.getElementsByTagName('body')[0].style.display = 'block';
        });
      }
    }
  });
};

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
