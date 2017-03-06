<template>
  <div class="twelve columns">
    <div class="results-card -selling">
      <h1 class="result-type -selling">Selling ( {{ sellingListLength }} )</h1>
      <div class="result-data">
        <div class="result-child" v-for="post in filteredSellingList">
          <a target="_blank" :href="post.data.url"><span>{{findHave(post.data.title)}}</span></a>
          <span class="extras">{{post.data.author}} | {{post.data.score}} | ({{ findLocation(post.data.title) }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'selling-posts',
    props: ['sellingPosts', 'searchObj'],
    computed: {
      sellingListLength() {
        return this.filteredSellingList.length;
      },
      filteredSellingList() {
        return this.sellingPosts.filter((post) => {
          // console.log(post.data.title);
          return post.data.title.toLowerCase().includes(this.searchObj);
        })
      },
    },
    methods: {
        flairTextSetter(flair) {
          if (flair == null) return;
          return `-${flair.toLowerCase()}`;
        },
        findLocation(title) {
          let content = title.match(/\[(.*?)\]/)[1];
          // console.log('location: ' + content);
          return content;
        },
        findHave(title) {
          let content = title.match(/\](.*?)\[/g)[1];
          let contentCut = content.replace(/[\[\]']/g,'' );
          // console.log('have: ' + contentCut);
          return contentCut;
        },
        findWant(title) {
          let content = title.match(/[W](.*)/)[1];
          let contentCut = content.replace(/[\[\]']/g,'' );
          // console.log('want: ' + contentCut);
          return contentCut;
        }
      }
    }
</script>