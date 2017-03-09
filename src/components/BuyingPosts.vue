<template>
  <div class="eleven columns offset-by-one">
    <div class="results-card -buying">
      <h1 class="result-type -buying">Buying ( {{ buyingListLength }} )</h1>
      <div class="result-data">
        <div class="row">
        <div class="result-child eleven columns offset-by-one" v-for="post in filteredBuyingList">
          <a target="_blank" :href="post.data.url">
            <span class="date">{{ timePosted(post.data.created_utc) }}<i class="fa fa-circle-thin indicator"></i></span>
            <!-- <div class="raise"> -->
              <!-- <i class="fa fa-keyboard-o"></i> -->
            <!-- </div> -->
            <div class="six columns offset-by-one center">
              <span>Want - {{findWant(post.data.title)}}</span>
            </div>
          </a>
            <div class="four columns offset-by-seven center">
              <span class="extras -buying">{{ post.data.author }}</span>
              <span class="extras -location">{{ findLocation(post.data.title) }}</span>
              <span class="extras -points">{{ post.data.score }} points</span>
            </div>
            <!-- <span class="extras">{{post.data.author}} | {{post.data.score}} | ({{ findLocation(post.data.title) }})</span> -->
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'buying-posts',
    props: ['buyingPosts', 'searchObj', 'epoch'],
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
      timePosted(time) {
        let date = new Date(time * 1000);
        let dateObj = date.getUTCHours() + ':' + date.getUTCMinutes();
        return dateObj;
      },
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