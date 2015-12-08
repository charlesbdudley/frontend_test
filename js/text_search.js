// Let's keep everything scoped to an object
var Riot = Riot || {};

// Wrapping this class declaration in an IIFE to
// keep global scope pure
(function() {

  /////////////////
  // Constructor //
  /////////////////
  /**
   * Represents a TextSearchComponent
   * @constructor
   * @param {Object} options - options with which to instantiate the object
   * @param {HTMLElement} options.searchTextElement - the element that contains the text to search
   * @param {String} options.query - an initial query to search
   *
   * @callback options.onSearchResult - a function that's called after a search has been completed
   * @param {String} query - the search query
   * @param {String[]} results - an array of search result snippits
   */
  function TextSearchComponent(options) {
    // We're removing citations from our searchable text
    // (more detail in removeCitations function below)
    var searchTextElementWithoutCitations = removeCitations(options.searchTextElement);
    this.textToSearch = searchTextElementWithoutCitations.innerText.trim();
    this.onSearchResult = options.onSearchResult;

    // Bind private functions to the instance's scope
    formatSearchResult = formatSearchResult.bind(this);
    removeCitations = removeCitations.bind(this);

    // If we are instantiated with a query, let's roll with it
    this.search(options.query);
  }

  ////////////////////
  // Public Methods //
  ////////////////////
  /**
   * Searches the block of text for matches
   * @param  {String} query
   */
  function search(query) {
    // Keep track of our query
    this.query = query;

    var results = [];
    var queryLength = query.length;
    var entireTextLength = this.textToSearch.length;

    // Only search if we have a query
    if (query.length) {
      // Create a regular expression out of the query
      // that will search globally and is case insensitive
      var regExp = new RegExp(query, 'gim');
      var match;

      // Find matches
      while ((match = regExp.exec(this.textToSearch)) !== null) {
        var result = formatSearchResult(match, queryLength, entireTextLength);

        results.push(result);
      }
    }

    // Call our supplied change listener
    this.onSearchResult.call(this, query, results);
  }

  // Expose these methods
  Object.assign(TextSearchComponent.prototype, {
    search: search
  });

  /////////////////////
  // Private Methods //
  /////////////////////
  /**
   * Removes all citations from the searchable HTML
   * so that a query of "Chelonii or Te" will still match
   * "Chelonii[2] of Test"
   * @param  {HTMLElement} element - the supplied html element of the text to search
   * @return {HTMLElement} A copy of the original element
   */
  function removeCitations(element) {
    // We're going to remove all citations from the searchable HTML
    // so that a query of "Chelonii or Te" will still match
    // "Chelonii[2] of Test"
    var clonedElement = element.cloneNode(true);
    var citations = clonedElement.getElementsByClassName('reference') || [];

    // Iterate through and remove citation elements
    while (citations.length) {
      citations.item(0).remove();
      citations = clonedElement.getElementsByClassName('reference');
    }

    return clonedElement;
  }

  /**
   * Creates a text snippit of a search result
   * @param  {RegExp} match - RegExp of a search match
   * @param  {Number} queryLength - length of query
   * @param  {Number} entireTextLength - length of search text
   * @return {String} formatted text snippit of search result
   */
  function formatSearchResult(match, queryLength, entireTextLength) {
    // For each match we're going to include a snippit
    // of surrounding text. We're also going to include
    // indexes for where the query falls in the snippit
    var highlightIndexStart = match.index;
    var highlightIndexEnd = match.index + queryLength;
    var snippitIndexStart = match.index - 50;
    var snippitIndexEnd = match.index + 50;
    var formattedText = '';

    if (snippitIndexStart < 0) {
      snippitIndexStart = 0;
    }

    if (snippitIndexEnd >= entireTextLength) {
      snippitIndexEnd = entireTextLength - 1;
    }

    formattedText += '...' + this.textToSearch.substring(snippitIndexStart, highlightIndexStart);
    formattedText += '<span class="highlight">';
    formattedText += this.textToSearch.substring(highlightIndexStart, highlightIndexEnd);
    formattedText += '</span>';
    formattedText += this.textToSearch.substring(highlightIndexEnd, snippitIndexEnd) + '...';

    return formattedText;
  }

  // Make this class available to the world
  Riot.TextSearchComponent = TextSearchComponent;
})();
