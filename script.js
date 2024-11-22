const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

setupUI();

// ========= Infinite Scroll ========= //
window.addEventListener("scroll", function () {
  const endPage =
    window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
  if (endPage && currentPage < lastPage) {
    currentPage++;
    // when it paginates if this => document.querySelector(".posts").innerHTML = "";  => True
    //  ==> Then it will reload the page
    getPosts(false, currentPage);
  }
});

// ===================================================================================== //

// ==== Get Posts With Paginations ==== //
function getPosts(reload = true, page = 1) {
  axios
    .get(`${baseUrl}/posts?limit=5&page=${page}`)
    .then((response) => {
      toggleLoader(true);
      // Update For The Value
      lastPage = response.data.meta.last_page;

      // In The First Reload
      if (reload) {
        document.querySelector(".posts").innerHTML = "";
      }

      let posts = response.data.data;
      for (let post of posts) {
        let author = post.author;
        let user = getCurrentUser();
        let isMyPost = user != null && user.id === author.id;
        let btnEditAndDelete = "";

        if (isMyPost) {
          btnEditAndDelete = `
                <button type="button" class="btn btn-secondary" id="edit-btn" onclick="editPostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">Edit</button>
                <button type="button" class="btn btn-danger" id="delete-btn" onclick="deletePostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">Delete</button>
          `;
        }
        let postContent = `
        <div class="card shadow mt-5">
           <div
              class="card-header d-flex align-items-center justify-content-between"
            >
              <div class="info d-flex align-items-center" onclick="userClicked(${post.author.id})" style="cursor:pointer;">
                <img
                  src="${author.profile_image}"
                  class="card-img-top rounded-circle mx-2 border border-3"
                  style="width: 50px; height: 50px;"
                />
                <h3 class="fs-5">${author.username}</h3>
              </div>
              <div class="settings">
                 ${btnEditAndDelete}
              </div>
            </div>

            <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
              <img src="${post.image}" class="w-100 rounded" />
              <span class="Creation-time text-body-secondary fw-bold d-block my-2">${post.created_at}</span>
              <h4 class="post-title">${post.title}</h4>
              <p class="post-body fw-bold text-secondary">
               ${post.body}
              </p>
              <div class="card-footer py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-pen"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
                  />
                </svg>
                <span class="comments-count"> ( ${post.comments_count} ) </span> Comments
              </div>
            </div>
        </div>
        `;
        document.querySelector(".posts").innerHTML += postContent;
      }
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ===== Create A New Post Function ===== //
function createNewPostClicked() {
  let title = document.getElementById("post-title-input").value;
  let body = document.getElementById("post-body-input").value;
  let image = document.getElementById("post-img-input").files[0];
  let token = window.localStorage.getItem("token");

  let postId = document.getElementById("post-id-input").value;
  let isCreated = postId == null || postId == "";
  let url = "";

  // Headers
  let config = {
    Authorization: `Bearer ${token}`,
  };

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  if (isCreated) {
    url = `${baseUrl}/posts`;
  } else {
    // Just In This Api Not For All
    formData.append("_method", "put");
    url = `${baseUrl}/posts/${postId}`;
  }

  // Just In This Api Not For All
  axios
    .post(url, formData, {
      headers: config,
    })
    .then((response) => {
      toggleLoader(true);

      const modal = document.getElementById("create-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("New Post Has Been Created", "success");
      setupUI();
      getPosts();
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ===== Edit Post Button Clicked ===== //
function editPostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-modal-submit-btn").innerHTML = "Edit";

  const postModal = new bootstrap.Modal("#create-post-modal", {});
  postModal.toggle();
}

// ===================================================================================== //

// ===== Add Post Button Clicked Function ===== //
function addBtnClicked() {
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";

  // const postModal = new bootstrap.Modal("#create-post-modal", {});
  // OR
  const postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}

// ===================================================================================== //

// We Used addBtnClicked To Show The Modal From JS Not From HTML & We Used createNewPostClicked Function
// To Add A New Post & We Used editPostBtnClicked Funtion To Edit The Post
// But Both Are From The Same Modal => Create-post-modal
// We Create Input <input type="file" class="form-control" id="post-img-input" /> in Modal Create New Post
// After That When We Clicked On Edit Button They Send The Post Details To editPostBtnClicked Funtion
// in editPostBtnClicked Funtion We Put Id The Post Value In this input <input type="file" class="form-control" id="post-img-input" />
// The In createNewPostClicked Function We Import The Id Value And We Make The If Condition
//  isCreated = postId === null || postId == ""; else isEdited

// ===================================================================================== //

// ==== Login User Function ==== //
function loginBtnClicked() {
  let username = document.getElementById("username-login-input").value;
  let password = document.getElementById("password-login-input").value;

  let params = {
    username: username,
    password: password,
  };

  axios
    .post(`${baseUrl}/login`, params)
    .then((response) => {
      toggleLoader(true);

      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("user", JSON.stringify(response.data.user));

      // Hide The Modal When The User Clicked On Login Button & The Response Is Good
      const modal = document.getElementById("login-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Successfully logged in", "success");
      setupUI();
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ==== Delete Post Button ==== //
function deletePostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("delete-post-id-input").value = post.id;

  const postModal = new bootstrap.Modal("#delete-post-modal", {});
  postModal.toggle();
}

// ===================================================================================== //

// ==== Confirm Post Delete ==== //
function confirmPostDelete() {
  let postId = document.getElementById("delete-post-id-input").value;
  let token = window.localStorage.getItem("token");

  // Headers
  let config = {
    Authorization: `Bearer ${token}`,
  };

  axios
    .delete(`${baseUrl}/posts/${postId}`, {
      headers: config,
    })
    .then((response) => {
      // Hide The Modal When The User Clicked On Login Button & The Response Is Good
      const modal = document.getElementById("delete-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      showAlert("The Post Has Been Deleted Successfully", "success");
      setupUI();
      getPosts();
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ===== Logout User Function ===== //
function logout() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  setupUI();
  showAlert("Successfully logged out", "success");
}

// ===================================================================================== //

// ===== Register A New User ===== //
function registerBtnClicked() {
  let username = document.getElementById("username-register-input").value;
  let password = document.getElementById("password-register-input").value;
  let image = document.getElementById("profile-img-register-input").files[0];
  let name = document.getElementById("name-register-input").value;
  let email = document.getElementById("email-register-input").value;

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("image", image);
  formData.append("name", name);
  formData.append("email", email);

  axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
      toggleLoader(true);
      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Successfully Registered", "success");
      setupUI();
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ===== Get The Current User's Login Details ===== //
function getCurrentUser() {
  let user = null;

  let storageUser = window.localStorage.getItem("user");

  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}

// ===================================================================================== //

// ==== Post Clicked ==== //
function postClicked(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");

// ==== Get Post Clicked ==== //
function getPost() {
  axios
    .get(`${baseUrl}/posts/${id}`)
    .then((response) => {
      toggleLoader(true);
      const post = response.data.data;
      const author = post.author;
      const comments = post.comments;

      let commentsContent = ``;
      for (let comment of comments) {
        commentsContent += `
      <div class="mt-3 py-2 px-2 rounded" id="comments">
        <img src="${comment.author.profile_image}" id="img-comment" />
        <span class="fw-bold">${comment.author.username}</span>
          <p class="fw-bold fs-6" id="comment">
              ${comment.body}
          </p>
      </div>
        `;
      }
      document.getElementById(
        "username-span"
      ).innerHTML = `${author.username}'s`;
      let postContent = `
      <div class="card shadow mt-5 mb-5">
         <div
            class="card-header d-flex align-items-center justify-content-between"
          >
            <div class="info d-flex align-items-center" onclick="userClicked(${author.id})" style="cursor:pointer;">
              <img
                src="${author.profile_image}"
                class="card-img-top rounded-circle mx-2 border border-3"
                style="width: 50px; height: 50px;"
              />
              <h3 class="fs-5">${author.username}</h3>
            </div>
          </div>

          <div class="card-body">
            <img src="${post.image}" class="w-100 rounded" />
            <span class="Creation-time text-body-secondary fw-bold d-block my-2">${post.created_at}</span>
            <h4 class="post-title">${post.title}</h4>
            <p class="post-body fw-bold text-secondary">
             ${post.body}
            </p>
            <div class="card-footer py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-pen"
                viewBox="0 0 16 16"
              >
                <path
                  d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
                />
              </svg>
              <span class="comments-count"> ( ${post.comments_count} ) </span> Comments
              <div>
              ${commentsContent}
              </div>
                <div class="input-comment d-flex mt-2">
                    <input type="text" id="comment-input" class="form-control" placeholder="Add Your Comment Here...">
                    <button type="button" class="btn btn-outline-primary mx-2" id="add-comment" onclick="createCommentClicked()">Send</button>
                </div>
            </div>
          </div>
      </div>
      `;
      document.querySelector(".post").innerHTML = postContent;
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ==== Create A New Comment ==== //
function createCommentClicked() {
  let body = document.getElementById("comment-input").value;
  let token = window.localStorage.getItem("token");

  // Headers
  let config = {
    Authorization: `Bearer ${token}`,
  };

  // Params
  let params = {
    body: body,
  };

  axios
    .post(`${baseUrl}/posts/${id}/comments`, params, {
      headers: config,
    })
    .then((response) => {
      toggleLoader(true);
      showAlert("Comment successfully added", "success");
      setupUI();
      getPost();
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ==== User Clicked Funtion ==== //
function userClicked(userId) {
  window.location = `profile.html?userId=${userId}`;
}

// ===================================================================================== //

// ==== Get User Infromation ==== //
function getUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userId");

  axios
    .get(`${baseUrl}/users/${id}`)
    .then((response) => {
      toggleLoader(true);
      const user = response.data.data;
      document.getElementById("main-info-img").src = user.profile_image;
      document.getElementById("main-info-email").innerHTML = user.email;
      document.getElementById("main-info-username").innerHTML = user.username;
      document.getElementById("main-info-name").innerHTML = user.name;
      document.getElementById("posts-count").innerHTML = user.posts_count;
      document.getElementById("comments-count").innerHTML = user.comments_count;
      document.getElementById("user-owner").innerHTML = `${user.username}'s `;
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ==== Get User's Posts Function ==== //
function getPostsUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userId");

  axios
    .get(`${baseUrl}/users/${id}/posts`)
    .then((response) => {
      toggleLoader(true);
      let posts = response.data.data;
      document.querySelector(".posts").innerHTML = "";
      for (let post of posts) {
        let author = post.author;
        let user = getCurrentUser();
        let isMyPost = user != null && user.id === author.id;
        let btnEditAndDelete = "";

        if (isMyPost) {
          btnEditAndDelete = `
                <button type="button" class="btn btn-secondary" id="edit-btn" onclick="editPostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">Edit</button>
                <button type="button" class="btn btn-danger" id="delete-btn" onclick="deletePostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">Delete</button>
          `;
        }
        let postContent = `
        <div class="card shadow mt-5">
           <div
              class="card-header d-flex align-items-center justify-content-between"
            >
              <div class="info d-flex align-items-center" onclick="userClicked(${post.author.id})" style="cursor:pointer;">
                <img
                  src="${author.profile_image}"
                  class="card-img-top rounded-circle mx-2 border border-3"
                  style="width: 50px; height: 50px;"
                />
                <h3 class="fs-5">${author.username}</h3>
              </div>
              <div class="settings">
                 ${btnEditAndDelete}
              </div>
            </div>

            <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
              <img src="${post.image}" class="w-100 rounded" />
              <span class="Creation-time text-body-secondary fw-bold d-block my-2">${post.created_at}</span>
              <h4 class="post-title">${post.title}</h4>
              <p class="post-body fw-bold text-secondary">
               ${post.body}
              </p>
              <div class="card-footer py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-pen"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
                  />
                </svg>
                <span class="comments-count"> ( ${post.comments_count} ) </span> Comments
              </div>
            </div>
        </div>
        `;
        document.querySelector(".posts").innerHTML += postContent;
      }

      return;
    })
    .catch((error) => {
      const errorMessage = error.response.data.message;
      showAlert(errorMessage, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

// ===================================================================================== //

// ==== Profile Clicked ==== //
function profileClicked() {
  let user = getCurrentUser();
  let userId = user.id;
  window.location = `profile.html?userId=${userId}`;
}

// ===================================================================================== //

// ===== Setup UI ===== //
function setupUI() {
  let loginRegisterDiv = document.querySelector(".login-register");
  let logoutDiv = document.querySelector(".logout");
  let token = window.localStorage.getItem("token");
  let addButton = document.getElementById("add-btn");

  if (token == null) {
    // The User Is Not Logged In
    loginRegisterDiv.style.setProperty("display", "block", "important");
    logoutDiv.style.setProperty("display", "none", "important");

    // The Add Button Is Not Defined On Other Pages So We Need To Make This Condition
    if (addButton != null) {
      addButton.style.setProperty("display", "none", "important");
    }
  } else {
    // The User Is Logged In
    loginRegisterDiv.style.setProperty("display", "none", "important");
    logoutDiv.style.setProperty("display", "flex", "important");

    // The Add Button Is Not Defined On Other Pages So We Need To Make This Condition
    if (addButton != null) {
      addButton.style.setProperty("display", "block", "important");
    }

    const user = getCurrentUser();
    document.getElementById("username-nav").innerHTML = user.username;
    document.getElementById("img-nav").src = user.profile_image;
  }
}

// ===================================================================================== //

// ==== Alert Function ==== //
function showAlert(message, type) {
  const alert = document.getElementById("alert");

  // Function appendAlert
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alert.append(wrapper);
  };

  // Trigger The Funtion
  appendAlert(message, type);

  // Hide Alert After 5 Seconds
  setTimeout(() => {
    document.querySelector(".alert .btn-close").click();
  }, 5000);
}

// ===================================================================================== //

// ===== Toggle Loader ===== //
function toggleLoader(show = true) {
  if (show) {
    document.querySelector(".loader").style.visibility = "visible";
  } else {
    document.querySelector(".loader").style.visibility = "hidden";
  }
}

// ===================================================================================== //
