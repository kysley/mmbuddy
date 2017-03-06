export default {

  setSource(newState) {
    localStorage.setItem('newState', JSON.stringify(newState));
  },
  getSortNew() {
    return localStorage.getItem('newState');
  },
  storeCategory(buying, selling, trading) {
    localStorage.setItem('buying', buying);
    localStorage.setItem('selling', selling);
    localStorage.setItem('trading', trading);
  }
}