export default {

  setSource(newState) {
    localStorage.setItem('newState', JSON.stringify(newState));
  },
  getSortNew() {
    return localStorage.getItem('newState');
  },
  setVisitEpoch(visitEpoch) {
    localStorage.setItem('visitEpoch', visitEpoch);
  },
  getVisitEpoch() {
    return localStorage.getItem('visitEpoch');
  },
  storeCategory(buying, selling, trading) {
    localStorage.setItem('buying', buying);
    localStorage.setItem('selling', selling);
    localStorage.setItem('trading', trading);
  }
}