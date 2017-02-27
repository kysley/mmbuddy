<template>
  <div id="main">
      <div class="container">
        <div class="row">
          <div class="twelve columns">
            <input @keyup.enter="fetchData()" v-model="searchObj" type="text" class="form-control username-input" placeholder="Username" aria-describedby="u-addon" autocapitalize="off" autocorrect="off">
            <button @click="fetchData()" class="btn btn-secondary" type="button" :disabled="isLoading">Analyse</button>
          </div>
        </div>
      </div>
      <post-summary :newPosts="newPosts">
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
      username: '',
      comments: [],
      submitted: [],
      newPosts: [],
      isLoading: false,
      notFound: false,
      noPosts: false,
      finished: {
        comments: false,
        submitted: false
      }
    }
  },
  mounted() {
    this.$watch('searchObj', () => {
      this.reset();
    });
    // Auto fetch
    if (window.location.hash !== '') {
      this.searchObj = window.location.hash.split('#').pop().trim();
      this.fetchData();
    }
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
      this.noPosts = false;
      this.finished.comments = false;
      this.finished.submitted = false;
      this.comments = [];
      this.submitted = [];
      this.newPosts = [];
    },
    fetchData() {
      if (this.searchObj === "" || /[^a-zA-Z0-9_-]/.test(this.searchObj)) return;
      this.reset();
      document.title = `Searching for ${this.searchObj} – mmbuddy`;
      window.history.replaceState({}, "", `#${this.searchObj}`);
      this.isLoading = true;
      this.fetchAbout();
      // this.fetchCombined('comments');
      // this.fetchCombined('submitted');
    },
    fetchAbout() {
      // this.$http.get(`https://www.reddit.com/r/mechmarket/search.json?q=${this.searchObj}`)
      this.$http.get('https://www.reddit.com/r/mechmarket/new/.json')
      .then(response => {
        // console.log()
        this.about = response.body.data;
        let arr = response.body.data.children;
        console.log(response);
        if (!arr.length) {
          this.isLoading = false;
          this.finished[type] = true;
          if (!this[type].length && this.finished.comments && this.finished.submitted && !this.comments.length && !this.submitted.length)
              this.noPosts = true;
          return;
        }
        arr.forEach(item => {
          this.newPosts.push(item);
        });
        this.finished[type] = true;
      }).catch(response => {
        if (response.status === 404) {
          this.notFound = true;
          this.isLoading = false;
        }
      });
    },
    fetchCombined(type, after = "") {
        this.$http.get(`https://www.reddit.com/r/mechmarket/search/.json?q=${this.searchObj}&sort=new&restrict_sr=True`)
        .then(response => {
            let arr = response.body.data.children;
            console.log(response)
            // No more posts
            if (!arr.length) {
              this.isLoading = false;
              this.finished[type] = true;
              if (!this[type].length && this.finished.comments && this.finished.submitted && !this.comments.length && !this.submitted.length)
                  this.noPosts = true;
              return;
            }
            // Add additional posts to array
            arr.forEach(item => {
              this[type].push(item);
            });
            // If there's (almost certainly) more, recursively fetch more
            if (arr.length == 100) {
              this.fetchCombined(type, arr[99].data.name);
              return;
            }
          this.finished[type] = true;
          if (this.finished.comments && this.finished.submitted)
            this.isLoading = false;
        }).catch(response => {
            if (response.status === 404) {
              this.notFound = true;
              this.isLoading = false;
            }
        });
    }
  }
}
</script>

<style lang="scss">
html {
  box-sizing: border-box;
  font-size: 62.5%;
  margin: 0;
  padding: 0;
}
body {
  font-family: 'Avenir', -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          Oxygen-Sans,
          Ubuntu,
          Cantarell,
          "Helvetica Neue",
          sans-serif;
  background-color: #fff;
  line-height: 1.6;
  letter-spacing: 0.01rem;
  font-weight: 400;
}
.container {
  position: relative;
  width: 100%;
  max-width: 100%;
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