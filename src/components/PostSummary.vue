<template>
    <div class="row">
      <div class="four columns offset-by-four">
        <div class="results-card" v-for="post in newPosts">
          <h1 class="result-type" :class="flairTextSetter(post.data.link_flair_text)">{{post.data.link_flair_text}}</h1>
          <h2>{{ findLocation(post.data.title) }}</h2>
          <h3>{{ findWant(post.data.title) }}</h3>
          <h4>{{ findHave(post.data.title) }}</h4>
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
    props: ['username', 'about', 'comments', 'submitted', 'isLoading', 'newPosts'],
    data() {
        return {
            subreddits: {},
            commentKarma: 0,
            submittedKarma: 0,
            subredditCounts: [],
            wordCounts: [],
            daysComments: [],
            daysSubmitted: [],
            allDaysComments: [],
            allDaysSubmitted: [],
            numSubreddits: 10,
            numFrequentWords: 15,
            badWordIncidence: 0,
            niceWordIncidence: 0,
            readingLevel: 0,
            commentsSortedByScore: null
        }
    },
    computed: {
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
          console.log('location: ' + content);
          return content;
        },
        findHave(title) {
          let content = title.match(/\](.*?)\[/g)[1];
          let contentCut = content.replace(/[\[\]']/g,'' );
          console.log('have: ' + contentCut);
          return contentCut;
        },
        findWant(title) {
          let content = title.match(/[W](.*)/)[1];
          let contentCut = content.replace(/[\[\]']/g,'' );
          console.log('want: ' + contentCut);
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
        smoothGraph() {
            let numDays = this.allDaysComments.length;
            if (numDays < 50) {
                numDays = 50;
            }
            let smoothingFactor = Math.round(numDays/50);
            let counter = 0;
            let counterSubmitted = 0;
            let days = [];
            this.allDaysComments.forEach(day => {
                if (counter % smoothingFactor === 0) {
                    days.push(day);
                }
                counter++;
            });
            this.daysComments = days;
            // reset
            days = [];
            counter = 0;
            numDays = this.allDaysSubmitted.length;
            if (numDays < 50) {
                numDays = 50;
            }
            smoothingFactor = Math.round(numDays/50);
            this.allDaysSubmitted.forEach(day => {
                if (counter % smoothingFactor === 0) {
                    days.push(day);
                }
                counter++;
            });
            this.daysSubmitted = days;
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
  .results-card {
  // box-shadow: 0 25px 40px -20px #efefef;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
  margin-bottom: 3em;
  height: 300px;
  .result-type {
    // width: 4em;
    // top: 50px;
    position: relative;
    font-size: 3em;
    &.-buying {
      color: #5b92fa;
    }
    &.-selling {
      color: #f5b400;
    }
    .result-have {
    }
  }
}
</style>