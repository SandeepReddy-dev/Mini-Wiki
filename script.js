let searchInputEl = document.getElementById("searchInput");
let searchResultsEl = document.getElementById("searchResults");
let spinnerEl = document.getElementById("spinner");
let suggestionsEl = document.getElementById("suggestions");

let currentPage = 1;
let resultsPerPage = 10;
let totalResults = 0;

function highlightTerm(text, term) {
  let regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, '<mark>$1</mark>');
}

function createAndAppendSearchResult(result, searchTerm) {
  let { link, title, description } = result;

  let resultItemEl = document.createElement("div");
  resultItemEl.classList.add("result-item");

  let titleEl = document.createElement("a");
  titleEl.href = link;
  titleEl.target = "_blank";
  titleEl.innerHTML = highlightTerm(title, searchTerm);
  titleEl.classList.add("result-title");
  resultItemEl.appendChild(titleEl);

  let titleBreakEl = document.createElement("br");
  resultItemEl.appendChild(titleBreakEl);

  let urlEl = document.createElement("a");
  urlEl.classList.add("result-url");
  urlEl.href = link;
  urlEl.target = "_blank";
  urlEl.textContent = link;
  resultItemEl.appendChild(urlEl);

  let linkBreakEl = document.createElement("br");
  resultItemEl.appendChild(linkBreakEl);

  let descriptionEl = document.createElement("p");
  descriptionEl.classList.add("link-description");
  descriptionEl.innerHTML = highlightTerm(description, searchTerm);
  resultItemEl.appendChild(descriptionEl);

  searchResultsEl.appendChild(resultItemEl);
}

function displayResults(searchResults, searchTerm) {
  spinnerEl.classList.add("d-none");
  totalResults = searchResults.length;

  let start = (currentPage - 1) * resultsPerPage;
  let end = currentPage * resultsPerPage;

  searchResultsEl.innerHTML = ""; // Clear previous results
  let pageResults = searchResults.slice(start, end);
  pageResults.forEach(result => createAndAppendSearchResult(result, searchTerm));

  updatePaginationButtons();
}

function updatePaginationButtons() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = (currentPage * resultsPerPage) >= totalResults;
}

function searchWikipedia(event) {
  if (event.key === "Enter") {
    spinnerEl.classList.remove("d-none");
    searchResultsEl.textContent = "";
    let searchInput = searchInputEl.value;

    let url = "https://apis.ccbp.in/wiki-search?search=" + searchInput;
    let options = {
      method: "GET"
    };

    fetch(url, options)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(function (jsonData) {
        let { search_results } = jsonData;
        if (search_results.length === 0) {
          searchResultsEl.innerHTML = "<p>No results found. Please try a different keyword.</p>";
        } else {
          displayResults(search_results, searchInput);
        }
      })
      .catch(function (error) {
        spinnerEl.classList.add("d-none");
        searchResultsEl.innerHTML = "<p>Something went wrong. Please try again later.</p>";
      });
  }
}

function fetchSuggestions(searchInput) {
  let url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=" + searchInput;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      suggestionsEl.innerHTML = ""; // Clear previous suggestions
      let suggestions = data[1]; // Data returned by the API
      suggestions.forEach(suggestion => {
        let option = document.createElement("option");
        option.value = suggestion;
        suggestionsEl.appendChild(option);
      });
    });
}

searchInputEl.addEventListener("input", () => {
  let searchInput = searchInputEl.value;
  if (searchInput) {
    fetchSuggestions(searchInput);
  } else {
    suggestionsEl.innerHTML = ""; // Clear suggestions if input is empty
  }
});

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    searchWikipedia({ key: "Enter" });
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if ((currentPage * resultsPerPage) < totalResults) {
    currentPage++;
    searchWikipedia({ key: "Enter" });
  }
});

searchInputEl.addEventListener("keydown", searchWikipedia);
