let page = 1;
const limit = 5;
const $container = $('#posts-container');
const $loading = $('#loading');

async function loadPosts() {
    $loading.show();

    $.getJSON(`/api/posts/my-posts?page=${page}&limit=${limit}`, function(posts) {
        $loading.hide(); 

        if (posts.length === 0) return; 

        posts.forEach((post, index) => {
            const $slide = $('<div>', { 
                class: 'carousel-item' + (index === 0 ? ' active' : '') 
            });
            const postContainer = $(`
                <div class="post-container">
                    <div class="user-badge">
                        <p>My Post</p>
                    </div>
                    <div class="image-container">
                        ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="${post.title}">` : ''}
                    </div>
                    <div class="post-caption">
                        <h5 class="post-title">${post.title}</h5>
                        <p class="post-content">${post.content}</p>
                        <button class="btn btn-danger delete-btn mt-3" data-post-id="${post.id}">Delete Post</button>
                    </div>
                </div>
            `);
            $slide.append(postContainer);
            $container.append($slide);
        });

        page++;
    });
}

// Event listener pentru delete
$(document).on('click', '.delete-btn', function() {
    const postId = $(this).data('post-id');
    
    if (confirm('Ești sigur că vrei să ștergi această postare?')) {
        $.ajax({
            url: '/api/posts/deletePost',
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({ id: postId }),
            success: function(response) {
                alert('Postare ștearsă cu succes!');
                location.reload(); // Reîncarcă pagina
            },
            error: function(xhr) {
                alert('Eroare la ștergere: ' + xhr.responseJSON.error);
            }
        });
    }
});

loadPosts();