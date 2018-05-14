import Carousel from './carousel'

let onReady = function () {
  new Carousel(document.querySelector('#carousel1'), {
    slidesVisible: 3,
    slidesToScroll: 2,
    loop: true
  })

  new Carousel(document.querySelector('#carousel2'), {
    slidesVisible: 2,
    slidesToScroll: 2,
    infinite: true,
    pagination: true
  })

  new Carousel(document.querySelector('#carousel3'), {
    slidesVisible: 2,
    slidesToScroll: 2,
    pagination: true,
    loop: true
  })

  new Carousel(document.querySelector('#carousel4'))
}

if (document.readyState !== 'loading') {
  onReady()
}
document.addEventListener('DOMContentLoaded', onReady)
