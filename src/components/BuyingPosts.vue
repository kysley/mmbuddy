<template>
  <div class="twelve columns">
    <div class="results-card -buying">
      <h1 class="result-type -buying">Buying ( {{ buyingListLength }} )</h1>
      <div class="result-data">
        <div class="result-child" v-for="post in filteredBuyingList">
          <a target="_blank" :href="post.data.url"><span>{{findWant(post.data.title)}}</span></a>
          <span class="extras">{{post.data.author}} | {{post.data.score}} | ({{ findLocation(post.data.title) }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'buying-posts',
    props: ['buyingPosts', 'searchObj'],
    computed: {
      buyingListLength() {
        return this.filteredBuyingList.length;
      },
      filteredBuyingList() {
        return this.buyingPosts.filter((post) => {
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