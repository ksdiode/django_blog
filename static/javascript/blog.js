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

// comment 처리
function getCommentTemplate(avatar, comment) {
  return `
  <div  class="card mt-3 border-0 comment" 
    data-comment-id="${comment.id}" data-post-id="${postId}" data-token="${token}">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <div class="d-inline-flex align-items-center">
        <img src="/media/avatar/${avatar}.png" class="rounded-circle me-2" width="20" height="20">
        ${avatar}
      </div>
      <div class="btn-group">
        <button type="button" class="btn py-0 px-1">
          <i class="fas fa-edit comment-edit"></i></button>
        <button type="button" class="btn px-1 py-0">
          <i class="fas fa-reply comment-reply"></i></button>          
        <button type="button" class="btn py-0 px-1">
          <i class="fas fa-trash-alt text-danger comment-delete"></i></button>
      </div>
    </div>
    <div class="card-body ">
      ${comment.content}
    </div>    
  </div>


  `;
}

async function create_comment(owner, postId, token) {
  const content = document.getElementById('comment-content').value;
  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/${postId}/comment/`;
  const headers = { 'X-CSRFToken': token };

  const comment = await api.post(path, { content }, headers);
  console.log(comment);

  const template = getCommentTemplate(owner, comment);
  const commentList = document.getElementById('comment-list');
  const commentNode = document.createElement('div');
  commentNode.innerHTML = template;
  commentList.prepend(commentNode);
}

async function edit_comment(comment) {
  const content = document.getElementById('comment-content').value;
  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/${postId}/comment/${comment.dataset.commentId}`;
  console.log(path);
  const headers = { 'X-CSRFToken': token };
  // const comment = await api.put(path, { content }, headers);
  // return comment;
}

async function delete_comment(comment) {
  if (!confirm('삭제할까요?')) return;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/${comment.dataset.postId}/comment/${comment.dataset.commentId}`;
  const headers = { 'X-CSRFToken': comment.dataset.token };
  const result = await api.remove(path, headers);
  if (result.ok) {
    comment.remove();
  } else {
    alert('삭제 실패');
  }
}

function getCommentEditTemplate(content) {
  return `
  <div class="comment-edit-panel mt-2 bg-light p-2">
    <textarea class="form-control">${content}</textarea>
    <div class="d-flex justify-content-end mt-2">
      <button type="button" class="comment-edit-btn btn btn-outline-secondary py-0">
        <i class="fas fa-check comment-edit-btn"></i>등록</button>
    </div>
  </div>
  `;
}

function showCommentEdit(comment) {
  const panel = document.querySelector('.comment-edit-panel');
  if (panel) {
    // 기존 것 있다면 복원 후 제거
    const content = panel.querySelector('textarea').value;
    panel.parentElement.innerText = content;
  }

  const body = comment.querySelector('.card-body');
  body.innerHTML = getCommentEditTemplate(body.innerText);
}

document.getElementById('comment-list').onclick = async function (e) {
  const comment = e.target.closest('.comment');
  // 댓글 수정 인터페이스 보이기
  if (e.target.classList.contains('comment-edit')) {
    showCommentEdit(comment);
  } else if (e.target.classList.contains('comment-edit-btn')) {
    edit_comment(comment);
  }

  // 댓글 삭제하기
  if (e.target.classList.contains('comment-delete')) {
    delete_comment(comment);
  }

  // 답글 인터페이스 보이기
  if (e.target.classList.contains('comment-reply')) {
  }
};
