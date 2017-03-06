<template>
  <div class="four columns offset-by-eight">
      <div class="sticky-card">
        <div class="result-data">
            <a v-for="post in stickyPosts" :href="post.data.url"><span>{{post.data.title}}</span></a>
        </div>
      </div>
  </div>
</template>

<script>
  export default {
    name: 'sticky-posts',
    props: ['stickyPosts', 'searchObj'],
  }
</script>