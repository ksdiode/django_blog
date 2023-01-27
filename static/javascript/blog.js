function changeCategory(page = 1, keyword = '') {
  var select = document.getElementById('category');
  var value =
    select.selectedIndex != 0 ? select.options[select.selectedIndex].value : '';
  location.href = `?page=${page}&category=${value}&keyword=${keyword}`;
}

function deletePost(url) {
  if (!confirm('삭제할까요?')) return;
  location.href = url;
}

async function toggleLike(id, target) {
  const res = await fetch('/blog/like/' + id);
  const { count } = await res.json();

  if (target.classList.contains('fas')) {
    // 좋아요 제거
    target.classList.remove('fas');
    target.classList.add('far');
  } else {
    // 좋아요 추가
    target.classList.remove('far');
    target.classList.add('fas');
  }
  target.nextSibling.textContent = ' ' + count;
  console.log(target.nextSibling);
}
