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
