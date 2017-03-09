<template>
  <div id="main">
  <symbol id="icon-search" viewBox="0 0 32 32">
  <title>search</title>
  <path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path>
  </symbol>
    <div class="container full">
      <div class="row">
        <div class="twelve columns">
        <transition name="slide-fade">
        <div class="search-wrapper" v-show="!showSummary">
        <h1 class="summary">Welcome, here's a quick summary of mechmarket</h1>
        <div class="three columns summary-box">
          <span class="summary-desc">posts in last 24h</span>
          <span v-if="checktfHError" class="summary-error">error getting information :(</span>
          <span v-show="!checktfHError" class="summary-info">{{ getPosts24H }}</span>
        </div>
        <div class="three columns summary-box">
          <span class="summary-desc">posts since last visit</span>
          <span v-show="checkMinusError" class="summary-error">error getting information :(</span>
          <span v-show="!checkMinusError" class="summary-info">{{ getPostsSince }}</span>
        </div>
        <div class="three columns summary-box">
          <span class="summary-desc">posts that involve selling</span>
          <span class="summary-info -selling">{{ getSellingLength }}</span>
        </div>
        <div class="three columns summary-box">
          <span class="summary-desc">posts that involve buying</span>
          <span class="summary-info -buying">{{ getBuyingLength }}</span>
        </div>
          <!-- <svg class="icon icon-search"><use xlink:href="#icon-search"></use></svg> -->
          <!-- <input v-model="searchObj" type="text" class="form-control search-input" placeholder="Search MechMarket eg. DSA, Let's Split, HHKB" aria-describedby="u-addon" autocapitalize="off" autocorrect="off"> -->
          <!-- <button @click="fetchData()" class="btn btn-secondary" type="button" :disabled="isLoading">Analyse</button> -->
        </div>
        </transition>
        <div class="menu-wrapper">
          <ul>
            <li v-on:click='toggleSource(), fetchData("new")' :class='{ active: checkNew }' class="item"><i class="fa fa-paper-plane" aria-hidden="true"></i></li>
            <li v-on:click='toggleSource(), fetchData("hot")' :class='{ active: !checkNew }' class="item"><i class="fa fa-fire" aria-hidden="true"></i></li>
            <li v-on:click='toggleCategory("buying")' :class='{ Tactive: currentCategory.buying }' class="item -buying">buying</li>
            <li v-on:click='toggleCategory("selling")' :class='{ Tactive: currentCategory.selling }' class="item -selling">selling</li>
            <li v-on:click='toggleCategory("trading")' :class='{ Tactive: currentCategory.trading }' class="item -trading">trading</li>
          </ul>
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
                  :searchObj="searchObj"
                  :epoch="epoch">
    </post-summary>
  </div>
</template>

<script>
// import the localStorage controller
import store from '../store'
// import component
import PostSummary from './PostSummary.vue'
export default {
  name: 'core',
  // require the component
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
      epoch: Math.round(new Date() / 1000),
      epochMinus: Math.round(new Date() / 1000) - 86400,
      lastVisitEpoch: '',
      postsSinceEpochMinus: '',
      postsSinceLastVisit: '',
      isLoading: false,
      notFound: false,
      noPosts: true,
      summary: true,
      // Control whether the user is getting new or hot posts
      currentSource: {
        sortnew: '',
        sorthot: '',
      },
      // Control which categories are shown
      currentCategory: {
        buying: false,
        selling: false,
        trading: false,
      },
      epochError: {
        tfH: false,
        minus: false,
      }
    }
  },
  // Before the view is rendered make sure to grab the latest info from localStorage
  created() {
    // Grab the stored values quick
    this.currentSource.sortnew = JSON.parse(store.getSortNew());
    this.lastVisitEpoch = JSON.parse(store.getVisitEpoch());
    // If this is the users first time visiting the page sortnew will be null,
    // so we need to set that
    if (this.currentSource.sortnew == null) {
      console.log('fixing empty params');
      this.currentSource.sortnew = true;
      // Set the value to true then grab it right after
      // There may be a more efficient way to go through this.. probably ternary?
      store.setSource(this.currentSource.sortnew);
      this.currentSource.sortnew = JSON.parse(store.getSortNew());
    };
    // Check if it's the users first visit...
    if (this.lastVisitEpoch == null) {
      this.lastVisitEpoch = this.epoch;
      store.setVisitEpoch(this.lastVisitEpoch);
    };

    // Ending comment for created() runtime
    console.log('finished localStorage');
    console.log('results(new):');
    console.log(this.currentSource.sortnew);

  },
  mounted() {
    // This happens after created(), so Vue already knows which Source to call
    this.fetchData();
    this.fetchEpoch24H();
    this.fetchEpochLast();
    // this.fetchStickied('hot');
    window.addEventListener('beforeunload', this.leaving);
  },
  computed: {
    valid() {
      return this.finishedLoading && this.comments.length;
    },
    finishedLoading() {
      if (!this.comments.length && !this.submitted.length) return;
      return this.finished.comments && this.finished.submitted;
    },
    showSummary() {
      return this.currentCategory.buying || this.currentCategory.selling || this.currentCategory.trading;
    },
    checkNew() {
      // Log whats going on
      console.log('new(comp)');
      console.log(this.currentSource.sortnew);
      // This return determines whether or not 'new' or 'hot' category is shown
      return this.currentSource.sortnew;
    },
    getBuyingLength() {
      return this.buyingPosts.length;
    },
    getSellingLength() {
      return this.sellingPosts.length;
    },
    getPosts24H() {
      return this.postsSinceEpochMinus;
    },
    getPostsSince() {
      return this.postsSinceLastVisit;
    },
    checkMinusError() {
      return this.epochError.minus;
    },
    checktfHError() {
      return this.epochError.tfH;
    }
  },
  methods: {
    // I don't think this will be used other than fetching a new source, but its here
    reset() {
      this.notFound = false;
      this.newPosts = [];
      this.tradingPosts = [],
      this.sellingPosts = [],
      this.buyingPosts = [],
      this.venderPosts = [],
      this.gbPosts = [],
      this.soldPosts = []
    },
    leaving() {
      console.log('called');
      this.lastVisitEpoch = Math.round(new Date() / 1000);
      store.setVisitEpoch(this.lastVisitEpoch);
    },
    // Switches between 'new' and 'hot' and saves it to localStorage
    toggleSource() {
      console.log('toggling source');
      this.currentSource.sortnew = !this.currentSource.sortnew;
      // this.currentSource.sorthot = !this.currentSource.sorthot;
      store.setSource(this.currentSource.sortnew, this.currentSource.sorthot);
    },
    // Toggles whether a category is shown or not
    // There 100% is a better way to do this I'm sure
    toggleCategory(category) {
      console.log(category);
      if (this.currentCategory[category] == true) {
        this.currentCategory[category] = false;
      } else {
        for (var cat in this.currentCategory) {
          this.currentCategory[cat] = false;
        }
        this.currentCategory[category] = true;
      }
    },
    // Directs to fetching the specific source and clears the data that is currently shown
    fetchData() {
      let type = this.currentSource.sortnew ? 'new' : 'hot';
      console.log('TYPE: ');
      console.log(type);
      // if (this.searchObj === "" || /[^a-zA-Z0-9_-]/.test(this.searchObj)) return;
      this.reset();
      // document.title = `Searching for ${this.searchObj} – mmbuddy`;
      // window.history.replaceState({}, "", `#${this.searchObj}`);
      this.isLoading = true;
      this.fetchAdv(type);
    },
    fetchEpochLast(after='') {
      this.$http.get(`http://www.reddit.com/r/mechmarket/search/.json?limit=100&after=${after}&q=timestamp%3A${this.lastVisitEpoch}..${this.epoch}&restrict_sr=on&syntax=cloudsearch`)
      .then(response => {
        this.postsSinceLastVisit += response.body.data.children.length;
        let arrLen = response.body.data.children.length;
        let arr = response.body.data.children;

        console.log(response);
        console.log(this.postsSinceLastVisit);
        if (arrLen == 100 && this.postsSinceLastVisit <= 200) {
          this.fetchEpochLast(arr[99].data.name);
          return;
        }
      }).catch(response => {
        if (response.status == 503 && this.postsSinceLastVisit != '') {
          this.postsSinceLastVisit = '100+';
        }
        console.log('last visit failed');
        this.epochError.minus = true;
      })
    },
    fetchEpoch24H(after='') {
      this.$http.get(`http://www.reddit.com/r/mechmarket/search/.json?limit=100&after=${after}&q=timestamp%3A${this.epochMinus}..${this.epoch}&restrict_sr=on&syntax=cloudsearch`)
      .then(response => {
        this.postsSinceEpochMinus += response.body.data.children.length;
        let arrLen = response.body.data.children.length;
        let arr = response.body.data.children;

        console.log(response);
        console.log(this.postsSinceEpochMinus);
        if (arrLen == 100) {
          this.postsSinceEpochMinus = '100+';
          return;
        }
      }).catch(response => {
        if (response.status == 503 && this.postsSinceEpochMinus != null) {
          // this.postsSinceEpochMinus = '100+';
          console.log('24H failed');
          this.epochError.tfH = true;
        }
      })
    },
    // Grab ONLY the stickied posts
    // Ideally this should only be done every few days, TODO
    fetchStickied(data) {
      this.$http.get(`https://www.reddit.com/r/mechmarket/${data}/.json`)
      .then(response => {
        // Grab the response
        // this.about = response.body.data;
        // console.log(this.about);
        let arr = response.body.data.children;
        // If nothing is in the response
        if (!arr.length) {
          this.isLoading = false;
          this.finished[type] = true;
          if (!this[type].length)
              this.noPosts = true;
          return;
        }
        // If the post is sticked put it into the array
        arr.forEach(item => {
          if (item.data.stickied) {
            this.stickyPosts.push(item);
          };
        });
      }).catch(response => {
        if (response.status === 404) {
          this.notFound = true;
          this.isLoading = false;
        }
      });
    },
    // Grab n posts from either 'new' or 'hot' and do some stuff with it
    fetchAdv(type) {
      this.$http.get(`https://www.reddit.com/r/mechmarket/${type}/.json?limit=${this.limit}`)
      .then(response => {
        // Same as above
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
        // For each post sort it accordingly
        arr.forEach(item => {
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
        console.log('catch');
        console.log('resp'+response.status);
        if (response.status === 502) {
          console.info("ASdSDASDAS");
          this.notFound = true;
          this.isLoading = false;
        }
      });
    },
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: HKLight;
  src: url('../assets/fonts/HKGrotesk-Light.otf') format('opentype');
}
@font-face {
  font-family: HKBold;
  src: url('../assets/fonts/HKGrotesk-Bold.eot'); /* IE9 Compat Modes */
  src: url('../assets/fonts/HKGrotesk-Bold.woff2') format('woff2'), /* Super Modern Browsers */
       url('../assets/fonts/HKGrotesk-Bold.woff') format('woff'), /* Pretty Modern Browsers */
       url('../assets/fonts/HKGrotesk-Bold.otf')  format('opentype'); /* Safari, Android, iOS */
}
@font-face {
  font-family: HK;
  src: url('../assets/fonts/HKGrotesk-Regular.eot'); /* IE9 Compat Modes */
  src: url('../assets/fonts/HKGrotesk-Regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('../assets/fonts/HKGrotesk-Regular.woff') format('woff'); /* Pretty Modern Browsers */
       /* url('HKGrotesk-Regular.otf')  format('opentype'); /* Safari, Android, iOS */
}
.slide-fade-enter-active {
  transition: all .3s ease .3s;
}
.slide-fade-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.slide-down-fade-enter-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0) .3s;
}
.slide-down-fade-leave-active {
  transition: all cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-down-fade-enter, .slide-down-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
.slide-down-fade-enter-to {
}
html {
  box-sizing: border-box;
  font-size: 62.5%;
}
body {
  margin: 0;
  padding: 0;
  font-family: HK;
  // background-color: #fff;
  background-color: #F2F2F2;
  line-height: 1.6;
  letter-spacing: 0.01rem;
  font-weight: 400;
}
.summary-box {
  position: relative;
  height: 100%;
  background: #FFF;
  margin-left: 0% !important;
  &:nth-of-type(1) {
    background: darken(#FFF, 1%) !important;
  }
  &:nth-of-type(2) {
    background: darken(#FFF, 1%) !important;
  }
  &:not(:last-of-type) {
    &:after {
      display: block;
      content: '';
      background: #F1F1F1;
      width: 1px;
      height: 65%;
      position: absolute;
      top: 16.5%;
      right: 0;
    }
  }
  .summary-desc {
    position: absolute;
    top: 25%;
    left: 20%;
    text-transform: uppercase;
    font-size: 1.5rem;
    color: #9e9e9e;
    font-family: HKLight;
  }
  .summary-error {
    position: absolute;
    top: 35%;
    margin-left: -32%;
    text-transform: uppercase;
    font-size: 1.5rem;
    color: #5b92fa;
  }
  .summary-info {
    font-family: HKBold;
    position: absolute;
    top: 27%;
    margin-left: -32%;
    font-size: 6rem;
    color: #2c2c3d;
  }
}
.summary {
  color: darken(#42425A,10%);
  font-weight: 300;
  font-size: 4rem;
  // width: 4em;
  margin-top: -2em;
  // left: 16vw;
  position: absolute;
  font-family: HKLight;
}
.search-wrapper {
  width: 85vw;
  height: 30vh;
  margin: 0 auto;
  right: -1vw;
  top: 10vh;
  // border-radius: 5px;
  // box-shadow: 0 25px 40px -20px #E4E7EA;
  margin-bottom: 5%;
  background-color: darken(#42425A,10%);
  position: fixed;
  z-index: 101;
}
.menu-wrapper {
  position: absolute;
  top: 10vh;
  left: 0;
  ul {
    // padding-left: 2em;
    li {
      text-align: left;
      display: block;
      left: 0;
      margin-bottom: 2em;
      cursor: pointer;
      color: darken(#ECECEC, 20%);
      font-size: 2rem;
      &.item {
        margin: .5em 1em .5em 1em;
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
.-selling {
  color: #f5b400 !important;
}
.-buying {
  color: #5b92fa !important;
}
.-trading {
  color: #9f46f2 !important;
}
.form-control {
  background-color: darken(#42425A,10%);
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
  padding-top: 5vh;
}
.icon {
  position: absolute;
  display: inline;
  width: 2em;
  height: 2em;
  margin-left: 15px;
  margin-top: 9vh;
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