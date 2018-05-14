'use strict'

export default class Carousel {
  /**
   * @callback moveCallback
   *
   * @param {number} index
   */

  /**
   * @param {Element} element
   * @param {Object} options
   * @param {Object} [options.slidesToScroll=1] Nombre d'élement à scroller
   * @param {Object} [options.slidesVisible=1] Nombre d'élement visible
   * @param {boolean} [options.loop=false] Activer le défilement en boucle sur les éléments
   * @param {boolean} [options.infinite=false] Activer le défilement infini sur les éléments
   * @param {boolean} [options.pagination=false] Activer la pagination
   * @param {boolean} [options.navigation=true] Activer la navigation (précédent, suivant)
   */
  constructor (element, options = {}) {
    this.element = element
    this.options = Object.assign({}, {
      slidesToScroll: 1,
      slidesVisible: 1,
      loop: false,
      infinite: false,
      pagination: false,
      navigation: true
    }, options)
    if (this.options.loop && this.options.infinite) {
      throw new Error('Un carousel ne peut être à la fois en boucle et en infini.')
    }

    let children = [].slice.call(element.children)
    this.isMobile = false
    this.currentItem = 0
    this.moveCallbacks = []
    this.offset = 0

    /* DOM */
    this.root = this.createDivWithClass('carousel')
    this.root.setAttribute('tabindex', '0')

    this.container = this.createDivWithClass('carousel-container')

    this.root.appendChild(this.container)
    this.element.appendChild(this.root)

    this.items = children.map(child => {
      let item = this.createDivWithClass('carousel-item')
      item.appendChild(child)

      return item
    })

    if (this.options.infinite) {
      this.offset = this.options.slidesVisible + this.options.slidesToScroll

      if (this.offset > children.length) {
        console.error('Vous n\'avez pas assez d\'élément dans le carousel', element)
      }

      this.items = [
        ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
        ...this.items,
        ...this.items.slice(0, this.offset).map(item => item.cloneNode(true))
      ]

      this.gotoItem(this.offset, false)
    }
    this.items.forEach(item => this.container.appendChild(item))

    this.setStyle()

    if (this.options.navigation) {
      this.createNavigation()
    }
    if (this.options.pagination) {
      this.createPagination()
    }

    /* Events */
    this.moveCallbacks.forEach(cb => cb(this.currentItem))
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize.bind(this))
    this.root.addEventListener('keyup', e => {
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        this.next()
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        this.prev()
      }
    })

    if (this.options.infinite) {
      this.container.addEventListener('transitionend', this.resetInfinite.bind(this))
    }
  }

  /**
   * Permet de créer une div avec la classe CSS passée en argument.
   *
   * @param {string} className
   *
   * @returns {HTMLDivElement}
   */
  createDivWithClass (className) {
    let div = document.createElement('div')
    div.setAttribute('class', className)

    return div
  }

  /**
   * Fixe la longueur du conteneur et des éléments.
   */
  setStyle () {
    let ratio = this.items.length / this.slidesVisible

    this.container.style.width = (ratio * 100) + '%'
    this.items.forEach(item => { item.style.width = ((100 / this.slidesVisible) / ratio) + '%' })
  }

  /**
   * Crée les flèches de navigation dans le DOM.
   */
  createNavigation () {
    let nextButton = this.createDivWithClass('carousel-next')
    let prevButton = this.createDivWithClass('carousel-prev')

    this.root.appendChild(nextButton)
    this.root.appendChild(prevButton)

    nextButton.addEventListener('click', this.next.bind(this))
    prevButton.addEventListener('click', this.prev.bind(this))

    if (this.options.loop === true) {
      return
    }

    this.onMove(index => {
      if (index === 0) {
        prevButton.classList.add('carousel-prev-hidden')
      } else {
        prevButton.classList.remove('carousel-prev-hidden')
      }

      if (this.items[this.currentItem + this.slidesVisible] === undefined) {
        nextButton.classList.add('carousel-next-hidden')
      } else {
        nextButton.classList.remove('carousel-next-hidden')
      }
    })
  }

  /**
   * Crée la pagination dans le DOM.
   */
  createPagination () {
    let pagination = this.createDivWithClass('carousel-pagination')
    this.root.appendChild(pagination)
    let buttons = []

    for (let i = 0; i < this.items.length - 2 * this.offset; i = i + this.options.slidesToScroll) {
      let button = this.createDivWithClass('carousel-pagination-button')
      button.addEventListener('click', () => { this.gotoItem(i + this.offset) })
      pagination.appendChild(button)
      buttons.push(button)
    }

    this.onMove(index => {
      let count = this.items.length - 2 * this.offset
      let activeButton = buttons[Math.floor(((index - this.offset) % count) / this.options.slidesToScroll)]

      if (activeButton) {
        buttons.forEach(button => { button.classList.remove('carousel-pagination-button-active') })
        activeButton.classList.add('carousel-pagination-button-active')
      }
    })
  }

  next () {
    this.gotoItem(this.currentItem + this.slidesToScroll)
  }

  prev () {
    this.gotoItem(this.currentItem - this.slidesToScroll)
  }

  /**
   * Permet d'aller à l'élément n°index.
   *
   * @param {number} index
   * @param {boolean} [animation=true]
   */
  gotoItem (index, animation = true) {
    if (index < 0) {
      if (this.options.loop) {
        index = this.items.length - this.slidesVisible
      } else {
        return
      }
    } else if (index >= this.items.length ||
      (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem)) {
      if (this.options.loop) {
        index = 0
      } else {
        return
      }
    }

    let translateX = index * -100 / this.items.length
    if (animation === false) {
      this.container.style.transition = 'none'
    }

    this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
    this.container.offsetLeft // force le raffraichissement

    if (animation === false) {
      this.container.style.transition = ''
    }

    this.currentItem = index

    this.moveCallbacks.forEach(cb => cb(index))
  }

  /**
   * Déplace le conteneur pour donner l'impression d'un slide infini.
   */
  resetInfinite () {
    if (this.currentItem <= this.options.slidesToScroll) {
      this.gotoItem(this.currentItem + (this.items.length - 2 * this.offset), false)
    } else if (this.currentItem >= this.items.length - this.offset) {
      this.gotoItem(this.currentItem - (this.items.length - 2 * this.offset), false)
    }
  }

  /**
   * Stocke les callbacks à exécuter lors d'un mouvement.
   *
   * @param {moveCallback} cb
   */
  onMove (cb) {
    this.moveCallbacks.push(cb)
  }

  /**
   * Applique ou non le style mobile lors d'un redimensionnement de la fenêtre.
   */
  onWindowResize () {
    let mobile = window.innerWidth < 800

    if (mobile !== this.isMobile) {
      this.isMobile = mobile
      this.setStyle()
      this.moveCallbacks.forEach(cb => cb(this.currentItem))
    }
  }

  /**
   * @returns {number}
   */
  get slidesToScroll () {
    return this.isMobile ? 1 : this.options.slidesToScroll
  }

  /**
   * @returns {number}
   */
  get slidesVisible () {
    return this.isMobile ? 1 : this.options.slidesVisible
  }
}
