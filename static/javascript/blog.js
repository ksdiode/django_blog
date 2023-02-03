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

async function addComment(comment) {
  const content = document.getElementById('comment-content').value;
  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/comment/${postId}/`;
  const headers = { 'X-CSRFToken': token };

  comment = await api.post(path, { content }, headers);
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

async function deleteComment(comment) {
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
      <button type="button" class="comment-edit-cancel-btn btn btn-outline-secondary py-0">
        취소</button>
      <button type="button" class="comment-edit-btn btn btn-outline-secondary ms-1 py-0">
        등록</button>
    </div>
  </div>
  `;
}

function cancelCommentEdit() {
  const panel = document.querySelector('.comment-edit-panel');
  if (panel) {
    const content = panel.querySelector('textarea').value;
    panel.parentElement.innerText = content;
  }
}

function showCommentEdit(comment) {
  cancelCommentEdit();
  const body = comment.querySelector('.card-body');
  body.innerHTML = getCommentEditTemplate(body.innerText);
}

function getReplyEditTemplate(commentId, content) {
  return `
  <div class="reply-edit-panel mt-2 bg-light p-2" data-comment-id="${commentId}">
    <textarea class="form-control" id="reply-textarea">${content}</textarea>
    <div class="d-flex justify-content-end mt-2">
      <button type="button" class="reply-edit-cancel-btn btn btn-outline-secondary py-0">취소</button>
      <button type="button" class="reply-edit-btn btn btn-outline-secondary ms-1 py-0">등록</button>
    </div>
  </div>
  `;
}

function cancelReplyEdit() {
  const panel = document.querySelector('.reply-edit-panel');
  if (panel) {
    const content = panel.querySelector('textarea').value;
    panel.parentElement.innerText = content;
  }
}

function showReplyEdit(comment, self) {
  cancelReplyEdit();
  const template = getReplyEditTemplate(comment.dataset.commentId, '');
  console.log(template);
  const replyList = comment.querySelector('.reply-list');
  replyList.innerHTML = template + replyList.innerHTML;
}

function getReplyTemplate(reply, userId = '----') {
  return `
  <div class="card mt-3 border-0 reply" data-reply-id="${reply.id}" data-post-id="${reply.post}">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <div class="d-inline-flex align-items-center">
        <img src="/media/avatar/${userId}" class="rounded-circle me-2" width="20" height="20">
          ${userId}
      </div>
      <div class="btn-group">
        <button type="button" class="btn py-0 px-1">
          <i class="fas fa-edit reply-edit"></i></button>
        <button type="button" class="btn py-0 px-1">
          <i class="fas fa-trash-alt text-danger reply-delete"></i></button>
      </div>
    </div>
    <div class="card-body ">
      ${reply.content}
    </div>
  </div>
  `;
}
async function addReply(comment) {
  const content = document.getElementById('reply-textarea').value;
  const commentId = comment.dataset.commentId;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/reply/${postId}/${commentId}/`;
  const headers = { 'X-CSRFToken': token };

  const reply = await api.post(path, { content }, headers);
  console.log(reply);

  // 템플릿 추가
  const panel = document.querySelector('.reply-edit-panel');
  const replyList = panel.parentNode;
  panel.remove();
  const template = getReplyTemplate(reply);
  replyList.innerHTML = template + replyList.innerHTML;
}

async function deleteReply(target) {
  const reply = target.closest('.reply');
  if (!confirm('삭제할까요?')) return;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/reply/${postId}/${reply.dataset.commentId}/${reply.dataset.replyId}/`;
  const headers = { 'X-CSRFToken': token };

  const result = await api.remove(path, headers);
  if (result.ok) {
    reply.remove();
  } else {
    alert('삭제 실패');
  }
}

document.getElementById('comment-list').onclick = async function (e) {
  const comment = e.target.closest('.comment');
  // 댓글 수정 인터페이스 보이기
  if (e.target.classList.contains('comment-edit')) {
    return showCommentEdit(comment);
  }
  // 댓글 수정
  else if (e.target.classList.contains('comment-edit-btn')) {
    return addComment(comment);
  }
  // 댓글 수정 인터페이스 없애기
  else if (e.target.classList.contains('comment-edit-cancel-btn')) {
    cancelCommentEdit();
  }
  // 댓글 삭제하기
  else if (e.target.classList.contains('comment-delete')) {
    deleteComment(comment);
  }
  // 답글 인터페이스 보이기
  else if (e.target.classList.contains('comment-reply')) {
    showReplyEdit(comment, e.target);
  }
  // 답글 인터페이스 없애기
  else if (e.target.classList.contains('reply-edit-cancel-btn')) {
    cancelReplyEdit();
  }
  // 답글 등록
  else if (e.target.classList.contains('reply-edit-btn')) {
    addReply(comment);
  }
  // 답글 등록
  else if (e.target.classList.contains('reply-delete-btn')) {
    deleteReply(e.target);
  }
};
