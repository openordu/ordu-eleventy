const elasticlunr = require("elasticlunr");

module.exports = function (collection) {
  // what fields we'd like our index to consist of
  var index = elasticlunr(function () {
    this.setRef('id');
    this.addField('title');
    this.addField('entities');
    this.addField('attributes');
    this.addField('sources');
    this.addField('tags');
    this.addField('categories');
    this.addField('summary');
    this.pipeline.remove(elasticlunr.stopWordFilter);
    this.pipeline.remove(elasticlunr.stemmer);
    // this.pipeline.addConditionally(elasticlunr.trimmer, elasticlunr.stopWordFilter, elasticlunr.stemmer);
    // this.saveDocument(false);
  }, {
    fields: {
      title: {boost: 2, bool: "AND", expand: true},
      entities: {boost: 2},
      attributes: {boost: 1},
      sources: {boost: 1},
      tags: {boost: 1},
      categories: {boost: 1},
      summary: {boost: 1}
    },
    bool: "OR",
    expand: true,
    min_token_length: 1 // Set this value as required
  });

  // loop through each page and add it to the index
  collection.forEach((page) => {
    // GAF-296 T4: page.template.frontMatter.data (sync monkey-patched internal
    // getter) is not async-friendly and errors on Eleventy 3. page.data is the
    // v3-native merged data cascade on the collection item.
    index.addDoc({
      id: page.url,
      title: page.data.title,
      entities: page.data.entities,
      attributes: page.data.attributes,
      sources: page.data.sources,
      tags: page.data.tags,
      categories: page.data.categories,
      summary: page.data.summary,
    });
  });

  return index.toJSON();
};