var searchInput = document.querySelector('#search-input');

searchInput.addEventListener('focus', function() {
  fetch('/search-index.json')
    .then(response => response.json())
    .then(indexJson => {
      // Load the index
      var index = elasticlunr.Index.load(indexJson);

      // Add event listener to the search field for input changes
      searchInput.addEventListener('input', function() {

        var searchTerm = this.value;

        var suggestionContainer = document.querySelector('#search-suggestions');

        // If input is empty, clear suggestions and hide container
        if (!searchTerm) {
          suggestionContainer.innerHTML = '';
          suggestionContainer.classList.add("hidden");
          return;
        }

        // Perform the search
        var results = index.search(searchTerm, {
          fields: {
            title: {boost: 2},
            entities: {boost: 1},
            attributes: {boost: 1},
            sources: {boost: 1},
            tags: {boost: 1},
            categories: {boost: 1},
            summary: {boost: 1},
          }
        });

        // Sort results: put those that start with the searchTerm at the top
        results.sort(function(a, b) {
          var titleA = a.doc.title.toLowerCase();
          var titleB = b.doc.title.toLowerCase();
          var searchTermLower = searchTerm.toLowerCase();

          if (titleA.startsWith(searchTermLower) && !titleB.startsWith(searchTermLower)) {
            return -1;
          } else if (!titleA.startsWith(searchTermLower) && titleB.startsWith(searchTermLower)) {
            return 1;
          } else {
            return 0;
          }
        });

        // Clear previous suggestions
        suggestionContainer.innerHTML = '';

        // Add new suggestions
        results.forEach(function(result) {
          var listItem = document.createElement("li");
          listItem.classList.add("truncate");
          listItem.innerHTML = `<a class="dropdown-item" href="${result.doc.id}">${result.doc.title}</a>`;
          suggestionContainer.appendChild(listItem);
          suggestionContainer.classList.remove("hidden");
        });
      });
    });
});
