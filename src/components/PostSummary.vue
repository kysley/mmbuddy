<template>
  <div class="container">
  <div class="row">
      <div class="four columns offset-by-eight">
          <div class="sticky-card">
            <div class="result-data">
                <a v-for="post in stickyPosts" :href="post.data.url"><span>{{post.data.title}}</span></a>
            </div>
          </div>
      </div>
  </div>
  <div class="row">
    <div v-if="this.currentCategory.selling" class="twelve columns">
      <div class="results-card -selling">
        <h1 class="result-type -selling">Selling</h1>
        <div class="result-data">
          <a v-for="post in filteredSellingList" :href="post.data.url"><span>{{findHave(post.data.title)}} - ({{ findLocation(post.data.title) }})</span></a>
        </div>
      </div>
    </div>
    <div v-if="this.currentCategory.buying" class="twelve columns">
      <div class="results-card -buying">
        <h1 class="result-type -buying">Buying</h1>
        <div class="result-data">
          <a v-for="post in filteredBuyingList" :href="post.data.url"><span>{{findWant(post.data.title)}} - ({{ findLocation(post.data.title) }})</span></a>
        </div>
      </div>
    </div>
    <div v-if="this.currentCategory.trading" class="twelve columns">
      <div class="results-card -trading">
        <h1 class="result-type -trading">Trading</h1>
        <div class="result-data">
          <a v-for="post in tradingPosts" :href="post.data.url"><span>{{findWant(post.data.title)}} <span class="trade">for</span> {{findHave(post.data.title)}} ({{ findLocation(post.data.title) }})</span></a>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
// import moment from 'moment'
export default {
    name: 'post-summary',
    components: {
    },
    props: ['newPosts', 'tradingPosts', 'sellingPosts', 'buyingPosts', 'venderPosts', 'gbPosts', 'stickyPosts', 'currentCategory', 'searchObj'],
    data() {
        return {
        }
    },
    computed: {
      filteredBuyingList() {
        return this.buyingPosts.filter((post) => {
          // console.log(post.data.title);
          return post.data.title.toLowerCase().includes(this.searchObj);
        })
      },
      filteredSellingList() {
        return this.sellingPosts.filter((post) => {
          // console.log(post.data.title);
          return post.data.title.toLowerCase().includes(this.searchObj);
        })
      },
        topSubreddits() {
            if (this.isLoading) {
                this.newUser = true;
                return;
            }
            if (!this.comments.length || isNaN(this.numSubreddits)) return;
            // Only run once per user
            if (this.newUser) {
                this.commentsSortedByScore = this.comments.slice(0).sort((a, b) => b.data.score - a.data.score);
                this.subredditCounts = this.calculateSubredditCounts();
            }
            let counts = this.subredditCounts.slice(0);
            if (counts.length > this.numSubreddits)
                counts.length = this.numSubreddits;
            return counts;
        },
        mostFrequentlyUsedWords() {
            if (this.isLoading || !this.comments.length || isNaN(this.numFrequentWords)) return;
            // Only run once per user
            if (this.newUser) {
                this.wordCounts = this.calculateWordCounts();
                this.newUser = false;
            }
            let counts = this.wordCounts.slice(0);
            if (counts.length > this.numFrequentWords)
                counts.length = this.numFrequentWords;
            return counts;
        },
        totalComments() {
            return this.comments.length;
        },
        totalSubmitted() {
            return this.submitted.length;
        },
        karmaPerComment() {
            if (!this.comments.length) return 'N/A';
            return Math.round(this.commentKarma/this.comments.length);
        },
        karmaPerSubmitted() {
            if (!this.submitted.length) return 'N/A';
            return Math.round(this.submittedKarma/this.submitted.length);
        },
        mostUpvotedComment() {
            if (!this.commentsSortedByScore) return;
            return this.commentsSortedByScore[0].data;
        },
        mostDownvotedComment() {
            if (!this.commentsSortedByScore) return;
            return this.commentsSortedByScore[this.commentsSortedByScore.length - 1].data;
        },
        kindnessScore() {
            let con = this.controversialityScore;
            let bwi = this.badWordIncidence;
            let nwi = this.niceWordIncidence;
            if (nwi === 0)
                nwi = .01;
            let negativeBehaviour = Math.round(5 * con * bwi/nwi); // 20% controversilaity is full strength
            if (negativeBehaviour > 100)
                negativeBehaviour = 100;
            return 100 - negativeBehaviour;
        },
        controversialityScore() {
            return Math.round(10 * this.calculateControversiality())/10;
        },
        userLink() {
            return `https://www.reddit.com/u/${this.username}`;
        },
        textComplexity() {
            const levels = ['very low', 'low', 'medium', 'high', 'very high', 'very high'];
            return levels[Math.floor(this.readingLevel / 20)];
        },
        readingLevelStyle() {
            return `width: ${this.readingLevel}%`;
        }
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
        },
        calculateSubredditCounts() {
            // Reset values for each user.
            this.commentKarma = 0;
            this.submittedKarma = 0;
            this.subreddits = {};
            // days comments
            let days = this.createSequenceOfDays(
                moment(1000 * this.comments[this.comments.length - 1].data.created_utc).format('YYYY-MM-DD'), // most recent (end of arr)
                moment(1000 * this.comments[0].data.created_utc).format('YYYY-MM-DD') // earliest (beginning of arr)
            );
            let daysWithComments = [];
            let arrIndex = 0;
            // Comments
            this.comments.slice(0).reverse().forEach(item => {
                this.commentKarma += item.data.score;
                daysWithComments.push(item);
                let day = moment(1000 * item.data.created_utc).format('YYYY-MM-DD');
                // Find the day in "days" array of objects then add the values.
                // There can be multiple items in the array with the same day.
                let newIndex = days.findIndex(item => item.day === day);
                if (newIndex === arrIndex) {
                    newIndex++;
                }
                arrIndex = newIndex;
                if (days[arrIndex]) {
                    days[arrIndex].numComments += 1;
                    days[arrIndex].commentKarma += item.data.score;
                    days[arrIndex].avgControversy = this.calculateControversiality(daysWithComments);
                }
                if (this.subreddits.hasOwnProperty(item.data.subreddit)) {
                    this.subreddits[item.data.subreddit] += 1;
                } else {
                    this.subreddits[item.data.subreddit] = 1;
                }
            });
            this.allDaysComments = days.slice(0);
            arrIndex = 0; // reset
            days = []; // reset
            if (this.submitted.length) {
                days = this.createSequenceOfDays(
                    moment(1000 * this.submitted[this.submitted.length - 1].data.created_utc).format('YYYY-MM-DD'), // most recent (end of arr)
                    moment(1000 * this.submitted[0].data.created_utc).format('YYYY-MM-DD') // earliest (beginning of arr)
                );
            }
            // Submissions
            this.submitted.slice(0).reverse().forEach(item => {
                this.submittedKarma += item.data.score;
                let day = moment(1000 * item.data.created_utc).format('YYYY-MM-DD');
                let newIndex = days.findIndex(item => item.day === day);
                if (newIndex === arrIndex) {
                    newIndex++;
                }
                arrIndex = newIndex;
                if (days[arrIndex]) {
                    days[arrIndex].numSubmitted += 1;
                    days[arrIndex].submittedKarma += item.data.score;
                }
                if (this.subreddits.hasOwnProperty(item.data.subreddit)) {
                    this.subreddits[item.data.subreddit] += 1;
                } else {
                    this.subreddits[item.data.subreddit] = 1;
                }
            });
            this.allDaysSubmitted = days.slice(0);
            this.smoothGraph();
            this.cumulative();
            let subredditCounts = [];
            for (let subreddit in this.subreddits) {
                subredditCounts.push(
                    {
                        name: subreddit,
                        count: this.subreddits[subreddit]
                    }
                )
            }
            subredditCounts.sort((a, b) =>  b.count - a.count);
            return subredditCounts;
        },
        calculateTextComplexity(text, words) {
            function numSyllables(word) {
                word = word.toLowerCase();
                if (word.length <= 2) return 1;
                word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
                word = word.replace(/^y/, '');
                return word.match(/[aeiouy]{1,2}/g) ? word.match(/[aeiouy]{1,2}/g).length : 1;
            }
            let totalSyllables = 0;
            let totalSentences = 0;
            let sentenceRegex = new RegExp(/\w[.?!](\s|$)/g);
            while (sentenceRegex.exec(text) !== null) {
                totalSentences++;
            }
            words.forEach(word => {
                totalSyllables += numSyllables(word);
            });
            return 100 - Math.round(
                    206.835 - ( 1.015 * (words.length / totalSentences) + 84.6 * (totalSyllables / words.length) )
                );
        },
        createSequenceOfDays(beginning, end) {
            let days = [];
            const beginningMinusOneDay = moment(1000 * moment(beginning).unix() - 86457 * 1000).format('YYYY-MM-DD');
            const endPlusOneDay = moment(1000 * moment(end).unix() + 86457 * 1000).format('YYYY-MM-DD');
            let unix = 1000 * moment(beginningMinusOneDay).unix();
            while (moment(unix).format('YYYY-MM-DD') !== endPlusOneDay) {
                days.push({
                    day: moment(unix).format('YYYY-MM-DD'),
                    numComments: 0,
                    commentKarma: 0,
                    numSubmitted: 0,
                    submittedKarma: 0
                });
                unix += 1000 * 86457; // milliseconds in a day (avg seconds in ~365.24 days)
            }
            return days;
        },
        calculateControversiality(comments = this.comments.slice(0)) {
            if (!comments.length) return 'N/A';
            if (comments.length < 5) return 0;
            let count = 0;
            comments.forEach(item => {
                if (item.data.controversiality == 1) {
                    count += 1;
                }
            });
            return Math.round(100 * 100 * count / comments.length)/100;
        },
        subredditLink(subreddit) {
            return `https://www.reddit.com/r/${subreddit}/`;
        },
        googleLink(word) {
            return `https://www.google.com/search?q=${word}`;
        },
        percentageOf(val) {
            return Math.round(100 * val/(this.comments.length + this.submitted.length));
        },
        date(type, timestamp) {
            if (!timestamp) return;
            if (type === 'relative') {
                return moment(1000 * timestamp).fromNow();
            } else if (type === 'utc') {
                return moment(1000 * timestamp).format("MMM Do, YYYY");
            }
        },
        cumulative() {
            let cumulativeNumComments = 0;
            let cumulativeCommentKarma = 0;
            let cumulativeNumSubmitted = 0;
            let cumulativeSubmittedKarma = 0;
            this.allDaysComments.forEach(day => {
                cumulativeNumComments += day.numComments;
                cumulativeCommentKarma += day.commentKarma;
                day.cumulativeNumComments = cumulativeNumComments;
                day.cumulativeCommentKarma = cumulativeCommentKarma;
            });
            this.allDaysSubmitted.forEach(day => {
                cumulativeNumSubmitted += day.numSubmitted;
                cumulativeSubmittedKarma += day.submittedKarma;
                day.cumulativeNumSubmitted = cumulativeNumSubmitted;
                day.cumulativeSubmittedKarma = cumulativeSubmittedKarma;
            });
        }
    }
}
</script>
<style lang="scss">
  .sticky-card {
    // position: relative;
    .result-data {
      position: absolute;
      right: -2%;
      top: 0;
      text-align: right;
      text-transform: uppercase;
    }
    a {
      text-decoration: none;
      color: #333;
      display: block;
      font-size: 1.6rem;
      margin-top: 1.2em;
      height: auto;
      &:hover {
        color: darken(#ECECEC, 20%);
        text-decoration: underline;
      }
    }
  }
  .results-card {
  // box-shadow: 0 25px 40px -20px #85a2ce;
  // background: #fff;
  border-radius: 5px;
  margin-bottom: 3em;
  // width: 400px;
  height: auto;
  padding: 2em 2em;
  padding-top: 0;
  text-align: left;
  overflow: hidden;
  transition: box-shadow .4s;
  &:hover {
    box-shadow: 0 20px 40px -20px #6980a3;
  }
  .result-data {
    padding-top: 3em;
    .trade {
      color: #9f46f2 !important;
      font-weight: bold;
    }
  }
  a {
    display: inline-flex;
    font-size: 1.3rem;
    margin: 3em;
    text-decoration: none;
    // color: #6B8C9D;
    // color: #939393;
    color: #717171;
    // width: 400px;
    &:hover {
      text-decoration: underline;
      color: darken(#717171, 20%);
    }
  }
  &.-selling {
    left: 0;
  }
  .result-type {
    top: -.5em;
    position: relative;
    text-align: left;
    // padding-left: 15%;
    font-size: 2.2em;
    text-transform: uppercase;
    // &:before {
    //   display: block;
    //   position: absolute;
    //   right: -30;
    //   margin: 0 auto;
    //   top: 2em;
    //   width: 92%;
    //   height: 1px;
    //   background: #EFF2F7;
    //   content: '';
    //   margin-bottom: 1em;
    // }
    &.-buying {
      color: #5b92fa;
    }
    &.-selling {
      color: #f5b400;
    }
    &.-trading {
      color: #9f46f2;
    }
  }
}
</style>