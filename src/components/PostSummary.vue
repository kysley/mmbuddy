<template>
  <div class="container fixed-fix">
<!--   <sticky-posts
                :stickyPosts="stickyPosts">
  </sticky-posts> -->
  <transition name="slide-down-fade" mode="out-in">
  <buying-posts v-show="this.currentCategory.buying"
                :buyingPosts="buyingPosts"
                :searchObj="searchObj"
                :epoch="epoch">
  </buying-posts>
  </transition>
  <transition name="slide-down-fade" mode="out-in">
  <selling-posts v-show="this.currentCategory.selling"
                :sellingPosts="sellingPosts"
                :searchObj="searchObj">
  </selling-posts>
  </transition>
  <transition name="slide-down-fade" mode="out-in">
  <trading-posts v-show="this.currentCategory.trading"
                :tradingPosts="tradingPosts"
                :searchObj="searchObj">
  </trading-posts>
  </transition>
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
    props: ['newPosts', 'tradingPosts', 'sellingPosts', 'buyingPosts', 'venderPosts', 'gbPosts', 'stickyPosts', 'currentCategory', 'searchObj', 'epoch'],
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
    top: 10vh;
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
  .indicator {
    font-size: 2rem;
    position: absolute;
    margin-left: -4vw;
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
  // &:hover {
  //   box-shadow: 0 20px 40px -20px #6980a3;
  // }
  .result-data {
    // padding-top: 3em;
    .trade {
      color: #9f46f2 !important;
      font-weight: bold;
    }
    .result-child {
      // display: inline-flex;
      // width: 90%;
      height: 10em;
      margin-bottom: 1em;
      margin-top: 1em;
      background: #FFF;
      border-radius: 5px;
      position: relative;
      box-shadow: 0 30px 30px -40px #5b92fa;
      .date {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        margin-left: -5vw;
        position: absolute;
        font-size: 1.2rem;
        color: darken(#42425A,10%);
      }
    }
  }
  .center {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .raise {
    box-shadow: 0 20px 40px -20px #6980a3;
    height: 7em;
    width: 4em;
    left: 2em;
    position: relative;
    z-index: 5;
    i {
      top: 50%;
      transform:translateY(-50%);
      font-size: 3rem;
      position: absolute;
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
    border-radius: 30px;
    padding: 1em 2em;
    &.-buying {
    background-color: rgba(91,146,250,.2);
    border: 1px solid #5b92fa;
    }
    &.-selling {
      border: 1px solid #f5b400;
      background-color: rgba(245,180,0,.2);
    }
    &.-trading {
      border: 1px solid #9f46f2;
      background-color: rgba(159,70,242,.2);
    }
    &.-location {
      border: 1px solid #2D7050;
      background-color: #CFF1C9;
      color: #2D7050;
    }
    &.-points {
      border: 1px solid #ff5500;
      background-color: rgba(255,85,0,.2);
      color: #ff5500;
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
    font-family: HKBold;
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