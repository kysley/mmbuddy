<template>
  <div class="container fixed-fix">
<!--   <sticky-posts
                :stickyPosts="stickyPosts">
  </sticky-posts> -->
  <buying-posts v-if="this.currentCategory.buying"
                :buyingPosts="buyingPosts"
                :searchObj="searchObj">
  </buying-posts>
  <selling-posts v-if="this.currentCategory.selling"
                :sellingPosts="sellingPosts"
                :searchObj="searchObj">
  </selling-posts>
  <trading-posts v-if="this.currentCategory.trading"
                :tradingPosts="tradingPosts"
                :searchObj="searchObj">
  </trading-posts>
  </div>
</template>

<script>
import SellingPosts from './SellingPosts.vue'
import BuyingPosts from './BuyingPosts.vue'
import TradingPosts from './TradingPosts.vue'
// import StickyPosts from './StickyPosts.vue'
export default {
    name: 'post-summary',
    components: {
      SellingPosts,
      BuyingPosts,
      TradingPosts,
    },
    props: ['newPosts', 'tradingPosts', 'sellingPosts', 'buyingPosts', 'venderPosts', 'gbPosts', 'stickyPosts', 'currentCategory', 'searchObj'],
    data() {
        return {
        }
    },
    computed: {},
    methods: {},
}
</script>
<style lang="scss">
  .fixed-fix {
    top: 20vh;
    z-index: 99;
  }
  .sticky-card {
    .result-data {
      position: absolute;
      right: -2%;
      top: -20vh;
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
    .result-child {
      display: inline-flex;
      margin: 3em;
    }
  }
  a {
    display: inline-flex;
    font-size: 1.3rem;
    // margin: 3em;
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
  .extras {
    position: absolute;
    // left: 0;
    margin-top: 2em;
    // display: block;
    width: auto;
    &:nth-of-type(1) {
      margin-left: 0em;
    }
    &:nth-of-type(2) {
      margin-left: 5em;
    }
    &:nth-of-type(3) {
      margin-left: 6em;
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