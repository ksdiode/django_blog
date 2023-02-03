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

/////////////////////////////////////////////////////////////
// comment 처리

// Comment DB 등록 후 보여줄 템플릿
function getCommentTemplate(userId, comment) {
  return `
  <div  class="card mt-3 border-0 comment" 
    data-comment-id="${comment.id}" data-post-id="${postId}" data-token="${token}">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <div class="d-inline-flex align-items-center">
        <img src="/accounts/avatar/${comment.owner}" class="rounded-circle me-2" width="20" height="20">
        ${userId}
      </div>
      <div class="btn-group">
        <button type="button" class="btn py-0 px-1">
          <i class="fas fa-edit comment-edit"></i></button>
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

// 서버에 Comment 등록하기
async function addComment(userId, comment) {
  const content = document.getElementById('comment-content').value;
  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/comment/${postId}/`;
  const headers = { 'X-CSRFToken': token };

  comment = await api.post(path, { content }, headers);

  const template = getCommentTemplate(userId, comment);
  const commentList = document.getElementById('comment-list');
  commentList.innerHTML = template + commentList.innerHTML;
  resetComment();
}

// Comment 템플릿의 내용 지우기
async function resetComment() {
  document.getElementById('comment-content').value = '';
}

//////////////////////////////////////////////////////////////
// 기존 Comment 수정, 삭제

// Comment 삭제
async function deleteComment(comment) {
  if (!confirm('삭제할까요?')) return;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/comment/${comment.dataset.postId}/${comment.dataset.commentId}/`;
  const headers = { 'X-CSRFToken': comment.dataset.token };
  const result = await api.remove(path, headers);
  if (result.ok) {
    comment.remove();
  } else {
    alert('삭제 실패');
  }
}

// 기존 Comment 수정 템플릿 만들기
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

// 기존 Comment 수정 화면 보여주기
function showCommentEdit(comment) {
  cancelCommentEdit();
  const body = comment.querySelector('.card-body');
  body.dataset.oldContent = body.innerText;
  body.innerHTML = getCommentEditTemplate(body.innerText);
}

// Comment 수정 취소하기
function cancelCommentEdit() {
  const panel = document.querySelector('.comment-edit-panel');
  if (panel) {
    // const content = panel.querySelector('textarea').value;
    const parent = panel.parentElement;
    parent.innerText = parent.dataset.oldContent;
    parent.dataset.oldContent = '';
  }
}

// 기존 Comment 수정 등록
async function updateComment(comment) {
  if (!confirm('수정할까요?')) return;

  const content = document
    .querySelector('.comment-edit-panel')
    .querySelector('textarea').value;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/comment/${postId}/${comment.dataset.commentId}/`;
  const headers = { 'X-CSRFToken': token };

  await api.put(path, { content }, headers);
  const body = comment.querySelector('.card-body');
  body.innerText = content;
}

/////////////////////////////////////////////////////////////////////
// 답글

// 답글 추가 화면 템플릿 얻기
function getReplyAddTemplate(commentId, content) {
  return `
  <div class="reply-add-panel mt-2 bg-light p-2" data-comment-id="${commentId}">
    <textarea class="form-control" id="reply-textarea">${content}</textarea>
    <div class="d-flex justify-content-end mt-2">
      <button type="button" class="reply-add-cancel-btn btn btn-outline-secondary py-0">취소</button>
      <button type="button" class="reply-add-btn btn btn-outline-secondary ms-1 py-0">등록</button>
    </div>
  </div>
  `;
}

// 답글 달기 화면 보이기
function showReplyAdd(comment, self) {
  cancelReplyAdd();
  const template = getReplyAddTemplate(comment.dataset.commentId, '');
  const replyList = comment.querySelector('.reply-list');
  replyList.innerHTML = template + replyList.innerHTML;
}

// 답글 달기 화면 취소
function cancelReplyAdd() {
  const panel = document.querySelector('.reply-add-panel');
  if (panel) {
    panel.remove();
  }
}

// 등록한 응답 추가 템플릿 얻기
function getReplyTemplate(reply) {
  return `
  <div class="card mt-3 border-0 reply" data-reply-id="${reply.id}" data-comment-id="${reply.parent}" data-post-id="${reply.post}">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <div class="d-inline-flex align-items-center">
        <img src="/accounts/avatar/${reply.owner}" class="rounded-circle me-2" width="20" height="20">
          ${reply.ownerName}
      </div>
      <div class="btn-group">
        <button type="button" class="btn py-0 px-1 reply-edit-btn">
          <i class="fas fa-edit reply-edit-btn"></i></button>
        <button type="button" class="btn py-0 px-1 reply-delete-btn">
          <i class="fas fa-trash-alt text-danger reply-delete-btn"></i></button>
      </div>
    </div>
    <div class="card-body ">
      ${reply.content}
    </div>
  </div>
  `;
}

// 답글 서버 등록
async function addReply(comment) {
  const content = document.getElementById('reply-textarea').value;
  const commentId = comment.dataset.commentId;

  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/reply/${postId}/${commentId}/`;
  const headers = { 'X-CSRFToken': token };

  const reply = await api.post(path, { content }, headers);

  // 템플릿 추가
  const panel = document.querySelector('.reply-add-panel');
  const replyList = panel.parentNode;
  panel.remove();
  reply.ownerName = ownerName;
  const template = getReplyTemplate(reply);
  replyList.innerHTML = template + replyList.innerHTML;
}

// 답글 삭제하기
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

// 답글 수정 화면 템플릿 얻기
function getReplyEditTemplate(reply) {
  return `
  <div class="reply-edit-panel mt-2 bg-light p-2" 
    data-comment-commentId="${reply.commentId}"
    data-comment-replyId="${reply.replyId}">
    <textarea class="form-control">${reply.content}</textarea>
    <div class="d-flex justify-content-end mt-2">
      <button type="button" class="reply-edit-cancel-btn btn btn-outline-secondary py-0">취소</button>
      <button type="button" class="reply-edit-save-btn btn btn-outline-secondary ms-1 py-0">등록</button>
    </div>
  </div>
  `;
}

// 답글 수정 화면 표시
function showReplyEdit(target) {
  const reply = target.closest('.reply');
  const replyId = reply.dataset.replyId;
  const commentId = reply.dataset.commentId;
  const body = reply.querySelector('.card-body');
  const content = body.innerText;
  reply.dataset.oldContent = content;

  console.log(postId, commentId, replyId, content);
  const template = getReplyEditTemplate({
    postId,
    commentId,
    replyId,
    content,
  });
  body.innerHTML = template;
}
// 답글 수정 화면 취소
function cancelReplyEdit(target) {
  const reply = target.closest('.reply');
  const content = reply.dataset.oldContent;
  reply.querySelector('.card-body').innerText = content;
  reply.dataset.oldContent = '';
}

// 답글 수정등록
async function updateReply(target) {
  console.log('updateReply');
  const reply = target.closest('.reply');
  const replyId = reply.dataset.replyId;
  const commentId = reply.dataset.commentId;
  const content = reply.querySelector('textarea').value;

  // 수정 등록
  const api = new Api('http://127.0.0.1:8000');
  const path = `blog/reply/${postId}/${replyId}/${commentId}/`;
  const headers = { 'X-CSRFToken': token };

  const result = await api.put(path, { content }, headers);

  reply.querySelector('.card-body').innerText = content;
  reply.dataset.oldContent = '';
}

document.getElementById('comment-list').onclick = async function (e) {
  const comment = e.target.closest('.comment');
  // 댓글 수정 인터페이스 보이기
  if (e.target.classList.contains('comment-edit')) {
    return showCommentEdit(comment);
  }
  // 댓글 수정
  else if (e.target.classList.contains('comment-edit-btn')) {
    return updateComment(comment);
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
    showReplyAdd(comment, e.target);
  }
  // 답글 인터페이스 없애기
  else if (e.target.classList.contains('reply-add-cancel-btn')) {
    cancelReplyAdd();
  }
  // 답글 등록
  else if (e.target.classList.contains('reply-add-btn')) {
    addReply(comment);
  }
  // 답글 삭제
  else if (e.target.classList.contains('reply-delete-btn')) {
    deleteReply(e.target);
  }
  // 답글 수정 인터페이스 보여 주기
  else if (e.target.classList.contains('reply-edit-btn')) {
    showReplyEdit(e.target);
  }
  // 답글 수정 인터페이스 취소
  else if (e.target.classList.contains('reply-edit-cancel-btn')) {
    cancelReplyEdit(e.target);
  }
  // 답글 수정 등록
  else if (e.target.classList.contains('reply-edit-save-btn')) {
    updateReply(e.target);
  }
};
