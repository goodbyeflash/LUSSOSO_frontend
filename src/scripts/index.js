import '../styles/reset.scss';
import '../styles/index.scss';
import api from './lib/api';

window.onload = function () {
  setRandingData();
  onClickDraw();
  document.getElementById('name').setAttribute('type', 'text');
  document.getElementById('hp').setAttribute('type', 'text');
  document.getElementById('branch').setAttribute('type', 'text');
};

function setRandingData() {
  // 이미지 및 유의 사항 적용
  const inner = document.getElementsByClassName('inner')[1];
  inner.innerHTML = '<h1>유의사항</h1>';
  api('get', 'content', {}, (res) => {
    if (res.msg == 'OK') {
      const data = res.result.data[0];
      const texts = data.text;
      if (texts) {
        texts.split('||').forEach((paragraph, index) => {
          inner.innerHTML += `<ul id='paragraph_${index}'></ul>`;
          const ul = document.getElementById(`paragraph_${index}`);
          paragraph.split('\n').forEach((text) => {
            ul.innerHTML += `<li>${text}</li>`;
          });
        });
      }
      document.getElementById('pcImg').src = data.imageUrlPc;
      document.getElementById('moImg').src = data.imageUrlMo;
      document.body.style.display = 'block';
    } else {
      alert('오류가 발생 했습니다.');
    }
  });
}

function onClickDraw() {
  document.getElementById('hp').onkeydown = (e) => {
    onlyNumber(e.target);
  };

  document.getElementsByClassName('btn-enter')[0].onclick = () => {
    const name = document.getElementById('name').value;
    const hp = document.getElementById('hp').value;
    const branch = document.getElementById('branch').value;
    const chk = document.getElementById('chk').checked;

    if (!chk || name == '' || hp == '' || branch == '') {
      alert('개인정보 등록 및 수집 동의를\n완료해 주시기 바랍니다.');
      return;
    }

    let check = /^[0-9]+$/;
    if (!check.test(hp)) {
      alert('연락처는 숫자만 입력 가능합니다.');
      return;
    }

    api(
      'post',
      'users',
      {
        name: name,
        hp: hp,
        branch: branch,
        publishedDate: new Date(),
      },
      (res) => {
        if (res) {
          if (res.msg == 'OK') {
            alert('응모가 완료되었습니다.\n감사합니다.');
          } else if (res.msg == 'ERROR') {
            if (res.result.response.data == 'Conflict') {
              alert('입력하신 정보는\n이미 등록된 고객의 정보입니다.');
            } else {
              alert('오류가 발생 했습니다.');
            }
          }
        } else {
          alert('오류가 발생 했습니다.');
        }
      }
    );
  };
}

function onlyNumber(obj) {
  obj.value = obj.value.replace(/[^0-9]/g, '');
}
