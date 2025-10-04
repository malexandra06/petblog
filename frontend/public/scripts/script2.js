let page = 1;
const limit = 5;
const $container = $('#posts-container');
const $loading = $('#loading');

async function loadPosts() {
    $loading.show();

    try {
        const response = await fetch(`/api/posts/posts?page=${page}&limit=${limit}`);
        const posts = await response.json();
        
        $loading.hide(); 

        if (posts.length === 0) return; 

        posts.forEach((post, index) => {
            const $slide = $('<div>', { 
                class: 'carousel-item' + (index === 0 ? ' active' : '') 
            });
            
            const postContainer = $(`
                <div class="post-container">
                    <div class="user-badge">
                        <!-- user info -->
                    </div>
                    <div class="image-container">
                        ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="${post.title}">` : ''}
                    </div>
                    <div class="post-caption">
                        <h5 class="post-title">${post.title}</h5>
                        <p class="post-content">${post.content}</p>
                    </div>
                </div>
            `);
            $slide.append(postContainer);
            $container.append($slide);
        });

        page++;
    } catch (error) {
        console.error('Eroare la încărcarea postărilor:', error);
        $loading.hide();
    }
}



loadPosts();