// Let's keep everything scoped to an object
var Riot = Riot || {};

// Wrapping this class declaration in an IIFE to
// keep global scope pure
(function() {

  /////////////////
  // Constructor //
  /////////////////
  /**
   * Represents a ImageRotatorComponent
   * @constructor
   * @param {Object} options - options with which to instantiate the object
   * @param {HTMLElement} options.container - the element that will hold the rotator
   * @param {Number} options.durationPerSlide - number of milliseconds per slide
   *
   * @param {Object[]} options.slides - array of slides
   * @param {String} options.slides[].title - slide title
   * @param {String} options.slides[].description - slide description
   * @param {String} options.slides[].image - path to slide image
   */
  function ImageRotatorComponent(options) {
    this.containerElement = options.container;
    this.duration = options.durationPerSlide;
    this.slides = options.slides;
    this.nSlides = this.slides.length;
    // we're starting out at -1 so we can animate in the first slide
    this.currentSlideIndex = -1;

    // Bind private functions to the instance's scope
    createSlides = createSlides.bind(this);
    getNextSlideIndex = getNextSlideIndex.bind(this);

    // Create the slide DOM elements and add them to the container
    createSlides();

    // automatically start playing
    this.play();
  }

  ////////////////////
  // Public Methods //
  ////////////////////
  /**
   * Main method to start the show
   */
  function play() {
    this.incrementSlide();
  }

  /**
   * The meat of the component. Determines if we're able
   * to animate to the next slide, and if so adds & removes
   * the appropriate classes to the current and next slide
   */
  function incrementSlide() {
    var nextSlideIndex = getNextSlideIndex(this.currentSlideIndex, this.nSlides);
    var currentSlideElement = this.containerElement.querySelector('.active');
    var nextSlideElement = this.containerElement.querySelector(`:scope > div:nth-child(${nextSlideIndex + 1})`);
    var nextSlideImageElement = nextSlideElement.querySelector('img');

    // Check to see if the next slide's image has loaded
    // and if not, let's wait 200ms and check again
    if (!nextSlideImageElement.complete) {
      this.timer && this.timer.cancelTimeout();
      return setTimeout(incrementSlide.bind(this), 200);
    }

    // remove active class from current slide
    if (currentSlideElement) {
      currentSlideElement.classList.add('inactive');
      currentSlideElement.classList.remove('active');
    }

    // Add active class to the next slide
    nextSlideElement.classList.remove('inactive');
    nextSlideElement.classList.add('active');
    this.currentSlideIndex = nextSlideIndex;

    // Keep track of the timer so we have the
    // ability to cancel it later
    this.timer = setTimeout(incrementSlide.bind(this), this.duration);
  }

  // Expose these methods
  Object.assign(ImageRotatorComponent.prototype, {
    play: play,
    incrementSlide: incrementSlide
  });

  /////////////////////
  // Private Methods //
  /////////////////////
  /**
   * Creates the DOM elements for each slide
   * and adds them to the provided container element
   */
  function createSlides() {
    var containerElement = this.containerElement;
    // Make sure the container is empty
    containerElement.innerHTML = null;

    // Add our own class so we can apply component's styles
    containerElement.classList.add('image_rotator');

    // Itereate through each provided slide
    this.slides.forEach(function(slide) {
      // Create respective html elements
      var slideElement = document.createElement('div');
      var imageElement = document.createElement('img');
      var metaContainerElement = document.createElement('div');
      var titleElement = document.createElement('h2');
      var descriptionElement = document.createElement('p');

      // Set the image src, title, description
      imageElement.setAttribute('src', slide.image);
      titleElement.innerHTML = slide.title;
      descriptionElement.innerHTML = slide.description;

      // Add image to slide
      slideElement.appendChild(imageElement);

      // Add title and description to the meta container
      metaContainerElement.appendChild(titleElement);
      metaContainerElement.appendChild(descriptionElement);

      // Give the meta container a class for future reference
      metaContainerElement.classList.add('meta');

      // Add the meta container to the slide
      slideElement.appendChild(metaContainerElement);

      // Finally, add the slide to the container
      containerElement.appendChild(slideElement);
    });
  }

  /**
   * A heler utility to get the next slide index
   * @param  {Number} currentSlideIndex - the slide index we're animating from
   * @param  {Number} nSlides - the total number of slides
   * @return {Number} - the slide index we're animating to
   */
  function getNextSlideIndex(currentSlideIndex, nSlides) {
    var nextSlideIndex = currentSlideIndex + 1;

    if (nextSlideIndex >= nSlides) {
      nextSlideIndex = 0;
    }

    return nextSlideIndex;
  }

  // Make this class available to the world
  Riot.ImageRotatorComponent = ImageRotatorComponent;
})();
