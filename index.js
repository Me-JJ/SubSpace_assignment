const express = require("express");
const getBlogs = require("./middleware/getBlogs");
const _ = require("lodash");

const PORT = 5050;

const app = express();

app.use(express.json());

const analytics = (blog_stats) => {
  const total_blogs = _.size(blog_stats);

  const titles = _.map(blog_stats, (x) => x.title.trim());

  const longest_title = _.reduce(titles, (prev, curr) => {
    return prev.length > curr.length ? prev : curr;
  });

  const Privacy_blogs = _.filter(titles, (title) =>
    _.includes(_.toLower(title), "privacy")
  );
  //   console.log(_.size(Privacy_blogs_count));

  const unique_titles = _.uniq(titles);
  //   console.log(unique_titles);
  const data = {
    "Total number of blogs ": total_blogs,
    "Longest blog title ": longest_title,
    "Number of blogs with 'privacy' in the title": _.size(Privacy_blogs),
    "Unique blog titles": unique_titles,
  };

  return data;
};
//storing cache for 5 mins
function resolverTime(...args) {
  const time = new Date().getMinutes() + 5;

  args.push({ time });

  const cacheKey = JSON.stringify(args);

  return cacheKey;
}

const memoized_Analysis = _.memoize(analytics, resolverTime);

app.get("/", (req, res) => {
  res.send(
    `<h1><a href="http://localhost:5050/api/blog_stats">GET BLOGS</a></h1>`
  );
});

app.get("/api/blog_stats", getBlogs, (req, res) => {
  //   res.send(req.blogData.blogs);
  const blog_stats = req.blogData.blogs;

  try {
    const result = memoized_Analysis(blog_stats);
    res.send(result);
  } catch (err) {
    res.status(404).json({ error: "Internal Server Error" });
    console.log("Error in analyzing data \n", err.message);
  }
});

const searching = (query, blogs) => {
  const query_string = _.toLower(query);
  const filtered_blogs = _.filter(blogs, (blog) => {
    return _.includes(_.toLower(blog.title), query_string);
  });

  return filtered_blogs;
};

const memoized_searching = _.memoize(searching, resolverTime);

app.get("/api/blog_search", getBlogs, (req, res) => {
  const blogs = req.blogData.blogs;
  try {
    const filtered_blogs = memoized_searching(req.query.query, blogs);
    res.send(
      _.isEmpty(filtered_blogs)
        ? { "No relevant matches for ": req.query.query }
        : filtered_blogs
    );
  } catch (err) {
    res.status(404).json({ error: "Internal Server Error" });
    console.log("Error in searching user query \n", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port : ${PORT}`);
});
