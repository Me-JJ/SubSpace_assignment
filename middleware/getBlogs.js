const { default: axios } = require("axios");

const url = "https://intent-kit-16.hasura.app/api/rest/blogs";
const header = {
  "x-hasura-admin-secret":
    "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
};

const getBlogs = async (req, res, next) => {
  try {
    const result = await axios.get(url, {
      headers: header,
    });
    // console.log("blog data -> ", result.data);
    req.blogData = result.data;

    next();
  } catch (err) {
    console.error("Error fetching blog stats -> middleware\n", err.message);
    res.status(404).json({ error: "Internal Server Error" });
  }
};

module.exports = getBlogs;
