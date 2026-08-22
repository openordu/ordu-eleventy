const { DateTime }                    = require("luxon");
// const doMarkdownIT                    = require('@digitalocean/do-markdownit');
const navigationPlugin                = require('@11ty/eleventy-navigation');
// const pluginMermaid                   = require("@kevingimbel/eleventy-plugin-mermaid");
const rssPlugin                       = require('@11ty/eleventy-plugin-rss');
const markdownIt                      = require("markdown-it");
const markdownItSub                   = require("markdown-it-sub");
const markdownItSup                   = require("markdown-it-sup");
const markdownItOrdu                  = require("markdown-it-ordu");
const markdownItAttrs                 = require("markdown-it-attrs");
const markdownItVideo                 = require("markdown-it-video");
const markdownItEmoji                 = require("markdown-it-emoji");
const markdownItAlign                 = require("markdown-it-align");
const markdownItTabs              = require("markdown-it-tabs");
const markdownItKatex                 = require("markdown-it-texmath");
const markdownItAnchor                = require("markdown-it-anchor");
const markdownItFootnote              = require("markdown-it-footnote");
const markdownItContainer             = require("markdown-it-container");
const markdownItTaskLists             = require("markdown-it-task-lists");
const eleventyNavigationPlugin        = require("@11ty/eleventy-navigation");
const markdownItTableOfContents       = require("markdown-it-table-of-contents");
const markdownItMark                  = require("markdown-it-mark");
const markdownItQuiz                  = require('markdown-it-quiz');
const frontmatter = require('frontmatter');
const fs = require('fs');
const markdownItNew = require('markdown-it');
const searchFilter = require("./src/_11ty/filters/searchFilter");
const slugify = require('slugify');

slugify.extend({
  'é': 'é', 'á': 'á', 'ó': 'ó', 'í': 'í', 'ú': 'ú', 
  'è': 'è', 'à': 'à', 'ù': 'ù', 'ì': 'ì', 'ô': 'ô', 
  'ê': 'ê', 'â': 'â', 'î': 'î', 'û': 'û', 'ë': 'ë', 
  'ï': 'ï', 'ÿ': 'ÿ', 'ç': 'ç'
});

// const eleventyPluginSyntaxHighlighter = require("@11ty/eleventy-plugin-syntaxhighlight");
const inspect = require("util").inspect;
const fileModifiedDate = require('./src/_11ty/filters/fileModifiedDate');
const timeAgo = require('./src/_11ty/filters/timeAgo');
const date = require('./src/_11ty/filters/date');
const readingTime = require('./src/_11ty/filters/readingTime');
// const markdownItMermaid = require("markdown-it-mermaid-plugin");
const markdownExternalLinks = require('markdown-it-external-links');

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

module.exports = function(eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addFilter("debug", (content) => `${inspect(content)}`);
  // eleventyConfig.addPlugin(eleventyPluginSyntaxHighlighter);
  eleventyConfig.addNunjucksAsyncFilter('fileModifiedDate', fileModifiedDate());
  eleventyConfig.addNunjucksFilter('keyBy', function(array, key) {
    return array.reduce(function(result, item) {
      result[item.data[key]] = item;
      return result;
    }, {});
  });
  eleventyConfig.addFilter("slugit", function(value) {
    return slugify(String(value), {
      lower: false,
      replacement: "-",
      remove: /[&”,+()$~%.’'":*?<>{}]/g,
      strict: false,
    });
  });
  eleventyConfig.addFilter("getIndexByKey", function(array, key) {
    return array.findIndex(item => item.key === key);
  });
  eleventyConfig.addFilter("findItemByKey", function(array, key) {
    return array.find(item => item.key === key);
  });
  eleventyConfig.addNunjucksFilter('timeAgo', timeAgo());
  eleventyConfig.addNunjucksFilter('date', date());
  eleventyConfig.addNunjucksFilter('readingTime', readingTime());


  // assets we want to passthrough
  eleventyConfig.addFilter(
    "startsWith",
    require("./src/_11ty/filters/startsWith")
  );

  eleventyConfig.addFilter("search", searchFilter);
  eleventyConfig.addFilter("findIndex", function(array, url) {
    return array.findIndex(item => item.url === url);
  });
  eleventyConfig.addPassthroughCopy('./src/main.css');
  eleventyConfig.addPassthroughCopy('./src/lib/main.js');
  eleventyConfig.addPassthroughCopy('./src/assets');

  // for markdown extensions
  let options = {
    html: true
  };
  let markdownLibrary = markdownIt(options).use(markdownItEmoji);
  markdownLibrary.use(markdownItAttrs); 
  markdownLibrary.use(markdownExternalLinks, {
    externalTarget: "_external",
    internalClassName: "custom-internal-link",
  });
  markdownLibrary.use(markdownItContainer, {
    validate: function(params) {
        return params.trim().split(' ')[0];
    }});
  markdownLibrary.use(markdownItFootnote);
  markdownLibrary.use(markdownItKatex);
  markdownLibrary.use(markdownItOrdu);
  markdownLibrary.use(markdownItQuiz);
  markdownLibrary.use(markdownItAlign);
  markdownLibrary.use(markdownItSub);
  markdownLibrary.use(markdownItSup);
  markdownLibrary.use(markdownItTabs);
  markdownLibrary.use(markdownItTableOfContents);
  markdownLibrary.use(markdownItTaskLists);
  markdownLibrary.use(markdownItMark);
  markdownLibrary.use(markdownItVideo);
  markdownLibrary.use(markdownItAnchor, {
    level: 2,
    permalinkClass: 'header-anchor',
    permalink: markdownItAnchor.permalink.linkInsideHeader({
      symbol: '<span class="visually-hidden">Jump to heading</span>\n<span aria-hidden="true">¶</span>',
      placement: 'after'
    })
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // function filterTagList(tags) {
  //   return (tags || []).filter(tag => ["all", "nav"].indexOf(tag) === -1);
  // }

  function filterTagList(tags) {
    // console.log(tags);
    return (tags || []).filter(tag => ["categoryList", "tagList", "sortedPosts", "docs", "pce", "all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("getAdjacentItems", function(array, currentIndex) {
    return {
      previous: array[currentIndex - 1],
      next: array[currentIndex + 1]
    };
  });
  eleventyConfig.addFilter("filterTagList", filterTagList)
  eleventyConfig.addCollection("sortedPosts", function(collection) {
    return collection.getFilteredByGlob("**/posts/*.md").sort(function(a, b) {
      // use fileModifiedDate if date is not available
      const aDate = a.data.date || a.template.inputContent.fileModifiedDate;
      const bDate = b.data.date || b.template.inputContent.fileModifiedDate;

      return aDate - bDate;
    });
  });
  eleventyConfig.addNunjucksFilter("replaceString", function(value, search, replacement) {
    return value.split(search).join(replacement);
  });

  eleventyConfig.addNunjucksFilter("extractHeadings", function(value) {
    // We only want headings with ids, which means markdown-it-anchor processed them
    const regex = /<h[1-6]\b[^>]*\bid="[^"]*"[^>]*>([^<]*)(?=\s*<a)/g;
    let match;
    let toc = '';

  
    while ((match = regex.exec(value)) !== null) {
      const [, text, id] = match;
      const href = encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, "-"));
      const tooltip = text.trim();
      toc += `<li class="text-truncate"><a href="#${href}" title="${tooltip}" class="text-primary">${tooltip}</a></li>`;
    }
  
    if (toc !== '') {
      toc = `<ul class="ms-2 px-2 text-truncate">${toc}</ul>`;
    }
  
    return toc;
  });  
  eleventyConfig.addFilter("findItemByUrl", function(array, url) {
    if (!array) {
      return;
    }
    // Recursive function to search through the array and its children
    function search(array) {
      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (item.url === url) {
          return { index: i, subPages: array };
        } else if (item.children) {
          const found = search(item.children);
          if (found) {
            return found;
          }
        }
      }
    }

    return search(array);
  });

  // Create a collection for each category
  eleventyConfig.addCollection("categoryList", function(collection) {
    let categorySet = new Set();
    collection.getAll().forEach(function(item) {
      if ('categories' in item.data) {
        let categories = item.data.categories;
        if (Array.isArray(categories)) {
          categories.forEach(category => {
            if (typeof category === 'string') {
              // Trim and convert category to lower case
              categorySet.add(String(category).replace('-', ' ').trim());
            }
          });
        }
      }
    });

    // Convert Set to Array
    return [...categorySet];
  });


  eleventyConfig.addCollection("tagList", collection => {
    const tagsObject = {}
    collection.getAll().forEach(item => {
        if (!item.data.tags) return;
        item.data.tags
          .map(tag => slugify(String(tag).trim(), {
            lower: false,
            replacement: " ",
            remove: /[-&”,+()$~%.’'":*?<>{}]/g,
            strict: false,
          }))
          .filter(tag => !['  ', 'sortedPosts', 'categoryList', 'tagList', 'pce', 'docs', 'post', 'posts', 'all'].includes(tag))
          .forEach(tag => {
              if(typeof tagsObject[tag] === 'undefined') {
                  tagsObject[tag] = 1
              } else {
                  tagsObject[tag] += 1
              }
          });
    });

    const tagList = []
    Object.keys(tagsObject).forEach(tag => {
        tagList.push({ tagName: tag, tagCount: tagsObject[tag]})
    })
    console.log(tagList.filter(tag => tag.tagName === 'Dubhlinn'));
    return tagList.sort((a, b) => b.tagCount - a.tagCount)
  });




  eleventyConfig.setTemplateFormats([
    "md", // markdown files
    "njk", // nunjucks templates
    // include other file types as needed
  ]);
  // GITHUB PAGES SUBPATH FIX: rewrite hardcoded absolute asset refs
  // (/js, /css, /assets, /img, /lib) to include the repo subpath in HTML output.
  eleventyConfig.addTransform("prefixAssets", function(content) {
    const SUBPATH = "/ordu-eleventy/";
    // Skip refs already prefixed (avoid double prefix)
    return content.replace(
      /((?:href|src)=")\/(?!ordu-eleventy\/)(js|css|assets|img|lib)\//g,
      `$1${SUBPATH}$2/`
    );
  });
  // Add a filter using the Config API
  eleventyConfig.addWatchTarget("./src/scss/");
  eleventyConfig.setBrowserSyncConfig({
    reloadDelay: 400
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc'
    }).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc'
    }).toFormat('yyyy-LL-dd');
  });
  return {
    pathPrefix: "/ordu-eleventy/",
    metadata: {
      url: "https://openordu.github.io/ordu-eleventy/", // Your website URL
    },
    dir: {
      input: "src",
      output: "dev"
    }
  };

};