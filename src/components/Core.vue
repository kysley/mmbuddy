<template>
  <div id="main">
  <symbol id="icon-search" viewBox="0 0 32 32">
  <title>search</title>
  <path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path>
  </symbol>
    <div class="container full">
      <div class="row">
        <div class="twelve columns">
        <div class="search-wrapper">
          <svg class="icon icon-search"><use xlink:href="#icon-search"></use></svg>
          <input v-model="searchObj" type="text" class="form-control search-input" placeholder="Filter" aria-describedby="u-addon" autocapitalize="off" autocorrect="off">
          <!-- <button @click="fetchData()" class="btn btn-secondary" type="button" :disabled="isLoading">Analyse</button> -->
          <div class="menu-wrapper">
            <ul>
              <li v-on:click='fetchData("new")' :class='{ active: currentSource.sortnew }' class="item">new</li>
              <li v-on:click='fetchData("hot")' :class='{ active: currentSource.sorthot }' class="item">hot</li>
              <li v-on:click='toggleCategory("buying")' :class='{ Tactive: currentCategory.buying }' class="item -buying">buying</li>
              <li v-on:click='toggleCategory("selling")' :class='{ Tactive: currentCategory.selling }' class="item -selling">selling</li>
              <li v-on:click='toggleCategory("trading")' :class='{ Tactive: currentCategory.trading }' class="item -trading">trading</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>
    <post-summary :newPosts="newPosts"
                  :tradingPosts="tradingPosts"
                  :sellingPosts="sellingPosts"
                  :buyingPosts="buyingPosts"
                  :venderPosts="venderPosts"
                  :gbPosts="gbPosts"
                  :soldPosts="soldPosts"
                  :stickyPosts="stickyPosts"
                  :currentCategory="currentCategory"
                  :searchObj="searchObj">
    </post-summary>
  </div>
</template>

<script>
import PostSummary from './PostSummary.vue'
export default {
  name: 'core',
  components: {
    PostSummary
  },
  data () {
    return {
      searchObj: '',
      limit: '40',
      username: '',
      newPosts: [],
      tradingPosts: [],
      sellingPosts: [],
      buyingPosts: [],
      venderPosts: [],
      gbPosts: [],
      soldPosts: [],
      stickyPosts: [],
      isLoading: false,
      notFound: false,
      noPosts: true,
      isBuying: true,
      isSelling: false,
      currentSource: {
        sortnew: true,
        sorthot: false,
      },
      currentCategory: {
        buying: true,
        selling: false,
        trading: false,
      }
    }
  },
  mounted() {
    // this.$watch('searchObj', () => {
    //   // this.reset();
    // });
    // // Auto fetch
    // if (window.location.hash !== '') {
    //   this.searchObj = window.location.hash.split('#').pop().trim();
    //   this.fetchData();
    // }
    this.fetchData('new');
    this.fetchStickied('hot');
  },
  computed: {
    valid() {
      return this.finishedLoading && this.comments.length;
    },
    finishedLoading() {
      if (!this.comments.length && !this.submitted.length) return;
      return this.finished.comments && this.finished.submitted;
    }
  },
  methods: {
    reset() {
      this.notFound = false;
      // this.noPosts = false;
      this.newPosts = [];
      this.tradingPosts = [],
      this.sellingPosts = [],
      this.buyingPosts = [],
      this.venderPosts = [],
      this.gbPosts = [],
      this.soldPosts = []
      // this.stickyPosts = [],
      // this.currentSource.sortnew = true;
      // this.currentSource.sorthot = false;
    },
    toggleSource() {
      this.currentSource.sortnew = !this.currentSource.sortnew;
      this.currentSource.sorthot = !this.currentSource.sorthot;
    },
    toggleCategory(category) {
      if (category in this.currentCategory) {
        this.currentCategory[category] = !this.currentCategory[category];
      }
    },
    fetchData(type) {
      // if (this.searchObj === "" || /[^a-zA-Z0-9_-]/.test(this.searchObj)) return;
      this.reset();
      if (this.noPosts == false) this.toggleSource();
      // document.title = `Searching for ${this.searchObj} – mmbuddy`;
      // window.history.replaceState({}, "", `#${this.searchObj}`);
      this.isLoading = true;
      this.fetchAdv(type);
      // this.fetchCombined('submitted');
    },
    fetchStickied(data) {
      this.$http.get(`https://www.reddit.com/r/mechmarket/${data}/.json`)
      .then(response => {
        this.about = response.body.data;
        console.log(this.about);
        let arr = response.body.data.children;
        if (!arr.length) {
          this.isLoading = false;
          this.finished[type] = true;
          if (!this[type].length)
              this.noPosts = true;
          return;
        }
        arr.forEach(item => {
          if (item.data.stickied) {
            this.stickyPosts.push(item);
          };
        });
        // this.currentChoice. = false;
        this.currentChoice['sort'+type] = true;
        console.log('sort'+type);
      }).catch(response => {
        if (response.status === 404) {
          this.notFound = true;
          this.isLoading = false;
        }
      });
    },
    fetchAdv(type) {
      // this.$http.get(`https://www.reddit.com/r/mechmarket/search.json?q=${this.searchObj}`)
      this.$http.get(`https://www.reddit.com/r/mechmarket/${type}/.json?limit=${this.limit}`)
      .then(response => {
        this.about = response.body.data;
        let arr = response.body.data.children;
        console.log(response);
        if (!arr.length) {
          this.isLoading = false;
          this.finished[type] = true;
          if (!this[type].length)
              this.noPosts = true;
          return;
        }
        arr.forEach(item => {
          // if (item.data.stickied) {
          //   this.stickyPosts.push(item);
          // };
          if (item.data.link_flair_text == 'Trading'){
            this.tradingPosts.push(item);
          };
          if (item.data.link_flair_text == 'Selling'){
            this.sellingPosts.push(item);
          };
          if (item.data.link_flair_text == 'Buying'){
            this.buyingPosts.push(item);
          };
        });
        this.noPosts = false;
        // this.currentSource['sort'+type] = true;
        console.log('sort'+type);
      }).catch(response => {
        if (response.status === 404) {
          this.notFound = true;
          this.isLoading = false;
        }
      });
    },
    // fetchCombined(type, after = "") {
    //     this.$http.get(`https://www.reddit.com/r/mechmarket/search/.json?q=${this.searchObj}&sort=new&restrict_sr=True`)
    //     .then(response => {
    //         let arr = response.body.data.children;
    //         console.log(response)
    //         // No more posts
    //         if (!arr.length) {
    //           this.isLoading = false;
    //           this.finished[type] = true;
    //           if (!this[type].length)
    //               this.noPosts = true;
    //           return;
    //         }
    //         // Add additional posts to array
    //         arr.forEach(item => {
    //           this[type].push(item);
    //         });
    //         // If there's (almost certainly) more, recursively fetch more
    //         if (arr.length == 100) {
    //           this.fetchCombined(type, arr[99].data.name);
    //           return;
    //         }
    //       this.finished[type] = true;
    //       if (this.finished.comments && this.finished.submitted)
    //         this.isLoading = false;
    //     }).catch(response => {
    //         if (response.status === 404) {
    //           this.notFound = true;
    //           this.isLoading = false;
    //         }
    //     });
    // }
  }
}
</script>

<style lang="scss">
html {
  box-sizing: border-box;
  font-size: 62.5%;
}
body {
  margin: 0;
  padding: 0;
  font-family: 'Avenir', -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          Oxygen-Sans,
          Ubuntu,
          Cantarell,
          "Helvetica Neue",
          sans-serif;
  // background-color: #fff;
  background-color: #ECECEC;
  line-height: 1.6;
  letter-spacing: 0.01rem;
  font-weight: 400;
}
.search-wrapper {
  width: 100%;
  height: 40vh;
  margin: 0 auto;
  // box-shadow: 0 25px 40px -20px #E4E7EA;
  // border-radius: 5px;
  margin-bottom: 5%;
  background-color: #F2F2F2;
  position: relative;
  .menu-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    ul {
      // width: 120px;
      li {
        display: inline-block;
        left: 0;
        margin-bottom: 2em;
        cursor: pointer;
        color: darken(#ECECEC, 20%);
        font-size: 2rem;
        &.item {
          margin: .5em 1em .5em 1em;
        }
        &.-selling {
          color: #f5b400;
        }
        &.-buying {
          color: #5b92fa;
        }
        &.-trading {
          color: #9f46f2;
        }
        &.active {
          text-decoration: underline;
          color: #333333;
        }
        &.Tactive {
          text-decoration: underline;
        }
      }
    }
  }
}
.form-control {
  background-color: #F2F2F2;
  margin: 1em;
  // margin-top: 5em;
  width: 30%;
  border: 0;
  outline: none;
  border-bottom: 1px #939393 solid;
  line-height: 1.6;
  height: 50px;
  font-size: 2rem;
  padding-left: 30px;
  padding-top: 5em;
}
.icon {
  position: absolute;
  display: inline;
  width: 2em;
  height: 2em;
  margin-left: 15px;
  margin-top: 13.2em;
  stroke-width: 0;
  fill: #939393;
  // fill: currentColor;
}
.full {
  width: 100% !important;
  max-width: 100% !important;
}
.container {
  position: relative;
  width: 90%;
  max-width: 90%;
  margin: 0 auto;
  padding: 0 1.25em;
  box-sizing: border-box;
}
.column,
.columns {
  width: 100%;
  float: left;
  box-sizing: border-box;
}

/* For devices larger than 400px */
@media (min-width: 400px) {
  .container {
    width: 85%;
    padding: 0;
  }
}

/* For devices larger than 550px */
@media (min-width: 550px) {
  .container {
    width: 100%;
  }
  .column,
  .columns {
    margin-left: 4%;
  }
  .column:first-child,
  .columns:first-child {
    margin-left: 0;
  }
  .one.column,
  .one.columns {
    width: 4.66666666667%;
  }
  .two.columns {
    width: 13.3333333333%;
  }
  .three.columns {
    width: 22%;
  }
  .four.columns {
    width: 30.6666666667%;
  }
  .five.columns {
    width: 39.3333333333%;
  }
  .six.columns {
    width: 48%;
  }
  .seven.columns {
    width: 56.6666666667%;
  }
  .eight.columns {
    width: 65.3333333333%;
  }
  .nine.columns {
    width: 74.0%;
  }
  .ten.columns {
    width: 82.6666666667%;
  }
  .eleven.columns {
    width: 91.3333333333%;
  }
  .twelve.columns {
    width: 100%;
    margin-left: 0;
  }
  .one-third.column {
    width: 30.6666666667%;
  }
  .two-thirds.column {
    width: 65.3333333333%;
  }
  .one-half.column {
    width: 48%;
  }
  /* Offsets */
  .offset-by-one.column,
  .offset-by-one.columns {
    margin-left: 8.66666666667%;
  }
  .offset-by-two.column,
  .offset-by-two.columns {
    margin-left: 17.3333333333%;
  }
  .offset-by-three.column,
  .offset-by-three.columns {
    margin-left: 26%;
  }
  .offset-by-four.column,
  .offset-by-four.columns {
    margin-left: 34.6666666667%;
  }
  .offset-by-five.column,
  .offset-by-five.columns {
    margin-left: 43.3333333333%;
  }
  .offset-by-six.column,
  .offset-by-six.columns {
    margin-left: 52%;
  }
  .offset-by-seven.column,
  .offset-by-seven.columns {
    margin-left: 60.6666666667%;
  }
  .offset-by-eight.column,
  .offset-by-eight.columns {
    margin-left: 69.3333333333%;
  }
  .offset-by-nine.column,
  .offset-by-nine.columns {
    margin-left: 78.0%;
  }
  .offset-by-ten.column,
  .offset-by-ten.columns {
    margin-left: 86.6666666667%;
  }
  .offset-by-eleven.column,
  .offset-by-eleven.columns {
    margin-left: 95.3333333333%;
  }
  .offset-by-one-third.column,
  .offset-by-one-third.columns {
    margin-left: 34.6666666667%;
  }
  .offset-by-two-thirds.column,
  .offset-by-two-thirds.columns {
    margin-left: 69.3333333333%;
  }
  .offset-by-one-half.column,
  .offset-by-one-half.columns {
    margin-left: 52%;
  }
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>